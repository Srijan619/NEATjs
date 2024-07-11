const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const formatStyleFromJSON = (obj) => {
    return Object.entries(obj).map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return `${kebabKey}: ${value}`;
    }).join('; ');
}

function tag(name, ...children) {
    // If children is effectively an empty nested array, return an empty element
    const result = document.createElement(name);

    for (const child of children) {
        if (typeof child === 'string') {
            result.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            result.appendChild(child);
        }
    }

    result.att$ = function (name, value) {
        if (typeof value === 'object') {
            value = formatStyleFromJSON(value);
        }
        this.setAttribute(name, value);
        return this;
    };

    // Bind reactiveness to element
    result.tuneIn$ = function (value) {
        const state = reactive(value);
        console.log(this, state);
    };

    result.onclick$ = function (callback) {
        this.onclick = callback;
        return this;
    };

    result.oninput$ = function (callback) {
        this.oninput = callback;
        return this;
    };

    return result;
}

const MUNDANE_TAGS = ["canvas", "h1", "h2", "h3", "p", "a", "div", "span", "select", 'button', 'label'];
for (let tagName of MUNDANE_TAGS) {
    let t = null;
    window[tagName] = (...children) => tag(tagName, ...children)
}

function img(src) {
    return tag("img").att$("src", src);
}

function input(type) {
    return tag("input").att$("type", type);
}

function inputRange(min, max, value) {
    return tag("input").att$("type", "range").att$("min", min).att$("max", max).att$("value", value || 0);
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


    function reactiveHandler(obj) {
        if (obj && obj.__isReactive) {
            return obj;
        }

        const handler = {
            get(target, key) {
                // if (typeof key === 'symbol') {
                //     return Reflect.get(target, key);
                // }

                const dep = getDep(key);
                dep.depend();
                const value = target[key];

                if (typeof value === 'object' && value !== null && !value.__isReactive) {
                    return reactiveHandler(value);
                }
                return value;
            },
            set(target, key, value) {
                const oldValue = target[key];
                const dep = getDep(key);
                const success = Reflect.set(target, key, value);

                if (success && oldValue !== value) {
                    dep.notify();
                    if (typeof value === 'object' && value !== null) {
                        target[key] = reactiveHandler(value);
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
                obj[index] = reactiveHandler(item);
            });

            // Wrap array methods to ensure they notify dependencies
            const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
            arrayMethods.forEach(method => {
                obj[method] = function (...args) {
                    const result = Array.prototype[method].apply(this, args);
                    getDep('length').notify();
                    return result;
                };
            });
        }

        return proxy;
    }

    return reactiveHandler(data);
}

// The code to watch to listen for reactive properties
function watcher(myFunc) {
    Dep.target = myFunc;
    Dep.target();
    Dep.target = null;
}

export { reactive, tag, img, input, inputRange, for$, watcher };