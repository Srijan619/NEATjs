const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const formatStyleFromJSON = (obj) => {
  return Object.entries(obj).map(([key, value]) => {
    // Convert camelCase to kebab-case
    const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    return `${kebabKey}: ${value}`;
  }).join('; ');
}

const isObject = (value) => value !== null && typeof value === 'object';
const isString = (value) => typeof value === 'string';
// TODO: Does this also need to take into account arrays? And second part is to check for reactive keys
const isReactive = (value) => (isObject(value) && value.__isReactive) || (isString(value) && value === '__isReactive');
const extractReactiveValue = (val) => val.value || val;

function canHaveValueAttribute(element) {
  return 'value' in element;
}

function tag(name, ...children) {
  // If children is effectively an empty nested array, return an empty element
  const result = document.createElement(name);

  for (const child of children) {
    if (isReactive(child)) {
      const reactiveValue = extractReactiveValue(child);
      result.appendChild(document.createTextNode(reactiveValue));
      const s = bindElementsMap.get(child);
      s?.add(result);
    }
    else if (typeof child === 'string') {
      result.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      result.appendChild(child);
    }
  }

  result.att$ = function(name, value) {
    if (isObject(value) && name === "style") {
      // JSON style to inline style formatting
      value = formatStyleFromJSON(value);
    }
    if (isReactive(value)) {
      // Set reactive values properly
      value = value.__value
    }
    this.setAttribute(name, value);
    return this;
  };

  // Two way binding to element (i.e data + input listener)
  // Receives reactiveValue
  // attribute (what to patch, "value" always as these are for input elements only)
  // and a callback which is null by default
  result.tuneIn$ = function(val, callback) {
    // set value reactive if it is not yet
    if (!isReactive(val)) {
      val = reactive(val);
    }

    // Set initial value to the attribute
    this.att$("value", val);

    patchAndUpdate(this, val, 'value', () => {
      this.oninput$((event) => {
        val.value = event.target.value;
        if (callback) callback(val);
      })
    })

    return this;
  };

  result.onclick$ = function(callback) {
    this.onclick = callback;
    return this;
  };

  result.oninput$ = function(callback) {
    this.oninput = callback;
    return this;
  };

  result.onchange$ = function(callback) {
    this.onchange = callback;
    return this;
  }


  return result;
}

const MUNDANE_TAGS = ["canvas", "h1", "h2", "h3", "p", "a", "div", "span", 'button', 'label'];
for (let tagName of MUNDANE_TAGS) {
  window[tagName] = (...children) => tag(tagName, ...children)
}

function img(src) {
  return tag("img").att$("src", src);
}

// All Basic Input types shortcuts
const INPUT_TYPES = ["text", "number", "range", "password", "checkbox", "radio", "date", "email", "file", "hidden", "image", "month", "reset", "search", "submit", "tel", "time", "url", "week"];

const basicInputTypes = INPUT_TYPES.reduce((acc, type) => {
  acc[`input${type.charAt(0).toUpperCase() + type.slice(1)}`] = () => input(type);
  return acc;
}, {});

function input(type) {
  return tag("input").att$("type", type);
}

function inputRange(min, max, value) {
  return tag("input").att$("type", "range").att$("min", min).att$("max", max).att$("value", value || 0);
}

function select(options, defaultTextContent) {
  const select = tag("select");
  options.forEach(option => {
    const optionEl = tag("option");
    optionEl.att$("value", option.value);
    optionEl.textContent = option.displayText;
    if (option.value === extractReactiveValue(defaultTextContent)) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  })

  select.value = extractReactiveValue(defaultTextContent);

  patchAndUpdate(select, options, 'value', () => {
    select.onchange$((event) => {
      const s = bindElementsMap.get(defaultTextContent)
      defaultTextContent.value = event.target.value;
    })
  })

  return select;
}

function for$(items, callback) {
  if (!items) return;

  // Add watcher for all reactive data
  //items.watchAll(callback);

  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => {
    if (item !== undefined && callback !== undefined) {
      const child = callback(item, index);
      if (child) fragment.appendChild(child);
    }
  });
  return fragment;
}

// Element patching

// Store the element in the bindElementsMap
const bindElementsMap = new Map();

// attribute by default is of type 'value'
const patchElements = (val, attribute) => {
  const elements = bindElementsMap.get(val);
  if (elements) {
    elements.forEach(element => {
      if (canHaveValueAttribute(element)) {
        element.att$(attribute, val)
      } else {
        element.textContent = extractReactiveValue(val);
      }
    });
  }
};

const patchAndUpdate = (el, val, attribute, callback) => {
  if (!val || !val.length) return;
  if (!bindElementsMap.has(val)) {
    bindElementsMap.set(val, new Set());
  }
  bindElementsMap.get(val).add(el);

  if (callback) callback() // call parent's needed action and then start watching it

  // Need to have some sort of patch rendering logic now here?
  // Automatically patch elements when reactive value changes
  watcher(() => {
    patchElements(val, attribute);
  });
}

// Simple Deep Watcher

class Dep {
  constructor() {
    this.subscribers = []
  }
  depend() {
    if (Dep.target && !this.subscribers.includes(Dep.target)) {
      // Only if there is a target & it's not already subscribed
      this.subscribers.push(Dep.target);
    }
  }
  notify() {
    this.subscribers.forEach(sub => sub());
  }

}

Dep.target = null;

function reactive(data) {
  const deps = new Map();

  function getDep(key) {
    if (!deps.has(key)) {
      deps.set(key, new Dep());
    }
    return deps.get(key);
  }

  const wrapPrimitive = (value) => {
    return new Proxy({ value }, primitiveHandler);
  };

  const primitiveHandler = {
    get(target, key) {
      if (isReactive(key)) return true;
      const dep = getDep('value');
      dep.depend();
      return target.value;
    },
    set(target, key, value) {
      const dep = getDep('value');
      const oldValue = target.value;
      target.value = value;
      if (oldValue !== value) {
        dep.notify();
      }
      return true;
    }
  };

  function nonPrimitiveeHandler(obj) {
    if (isReactive(obj)) {
      return obj;
    }

    const handler = {
      get(target, key) {
        const dep = getDep(key);
        dep.depend();
        const value = target[key];

        if (isObject(value) && !value.__isReactive) {
          return nonPrimitiveeHandler(value);
        }
        return value;
      },
      set(target, key, value) {
        const oldValue = target[key];
        const dep = getDep(key);
        const success = Reflect.set(target, key, value);

        if (success && oldValue !== value) {
          dep.notify();
          if (isObject(value)) {
            target[key] = nonPrimitiveeHandler(value);
          }
        }
        return success;
      }
    };

    const proxy = new Proxy(obj, handler);
    proxy.__isReactive = true;

    // Special case for arrays: wrap array elements with reactive proxies
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        obj[index] = nonPrimitiveeHandler(item);
      });

      // Wrap array methods to ensure they notify dependencies
      const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
      arrayMethods.forEach(method => {
        const original = Array.prototype[method];
        obj[method] = function(...args) {
          const result = original.apply(this, args);
          getDep('length').notify();
          return result;
        };
      });
    }

    return proxy;
  }

  function reactiveHandler() {
    if (isObject(data)) {
      return nonPrimitiveeHandler(data);
    } else {
      return wrapPrimitive(data);
    }
  }

  return reactiveHandler();
}

// The code to watch to listen for reactive properties
function watcher(myFunc) {
  Dep.target = myFunc;
  Dep.target();
  Dep.target = null;
}

// Export all functions, including dynamically generated input functions
export const {
  inputText,
  inputNumber,
  inputPassword,
  inputCheckbox,
  inputRadio,
  inputDate,
  inputEmail,
  inputFile,
  inputHidden,
  inputImage,
  inputMonth,
  inputReset,
  inputSearch,
  inputSubmit,
  inputTel,
  inputTime,
  inputUrl,
  inputWeek
} = basicInputTypes;

export { reactive, tag, img, input, inputRange, select, for$, watcher };
