const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const inlineStyleStringFromJSON = (str) => {
    return JSON.stringify(str)
        .replace(/[{}"]/g, '')              // Remove curly braces and double quotes
        .replace(/,/g, '; ')                // Replace commas with semicolons
        .replace(/([a-z])([A-Z])/g, '$1-$2') // Add hyphens between camelCase
        .toLowerCase();                     // Convert to lowercas
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
            value = inlineStyleStringFromJSON(value);
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

const MUNDANE_TAGS = ["canvas", "h1", "h2", "h3", "p", "a", "div", "span", "select", 'button'];
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

function for$(items, callback) {
    if (!items || !items.value) return;

    // Add watcher for all reactive data
    items.watchAll(callback);

    const fragment = document.createDocumentFragment();
    items.value.forEach((item, index) => {
        if (item !== undefined && callback !== undefined) {
            const child = callback(item, index);
            if (child) fragment.appendChild(child);
        }
    });
    return fragment;
}

// Simple Reactivity function

function reactive(param) {
    return new Reactive(param)
}
// Reactivity class

class Reactive {
    constructor(target) {
        this.target = target;
        this._listeners = new Map();
        this.value = this._createProxy(target);

        return this;
    }

    _createProxy(target) {
        const self = this;

        return new Proxy(target, {
            set(obj, prop, value) {
                const oldValue = obj[prop];
                // Use Reflect.set to set the property value
                const success = Reflect.set(obj, prop, value);

                // Notify change if the value actually changed
                if (success && oldValue !== value) {
                    self._notify(prop);
                }

                // If the new value is an object, make it reactive
                if (typeof value === 'object' && value !== null) {
                    obj[prop] = self._createProxy(value);
                }

                return success;
            },
            get(obj, prop) {
                // Handle array methods that modify the array
                if (Array.isArray(obj) && typeof obj[prop] === 'function') {
                    return function (...args) {
                        const result = Array.prototype[prop].apply(this, args);
                        self._notify(prop);
                        return result;
                    };
                }

                // Make nested objects reactive
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                    return self._createProxy(obj[prop]);
                }

                return obj[prop];
            }
        });
    }

    _notify(prop) {
        if (typeof prop === "object") {
            return this._notifyAll(prop)
        }
        if (this._listeners.has(prop)) {
            this._listeners.get(prop).forEach(callback => callback(this.getValue()));
        }
    }

    _notifyAllKeysOfAnObject(keys) {
        Object.keys(keys).forEach(prop => {
            this._notify(prop);
        });
    }
    _notifyAll(value) {
        if (Array.isArray(value)) {
            value.forEach((_) => {
                if (typeof _ === 'object') {
                    this._notifyAllKeysOfAnObject(_);
                }
            });
        } else if (typeof value === 'object' && value !== null) {
            this._notifyAllKeysOfAnObject(value);
        }

    }

    getValue() {
        return this.value;
    }

    setValue(newValue) {
        this.value = this._createProxy(newValue);
        this._notify(this.value);
    }

    watch(prop, callback) {
        if (!this._listeners.has(prop)) {
            this._listeners.set(prop, []);
        }
        this._listeners.get(prop).push(callback);
    }

    watchAllKeysOfAnObject(keys, callback) {
        Object.keys(keys).forEach(prop => {
            this.watch(prop, callback); // Add callback for each property
        });
    }

    watchAll(callback) {
        // Iterate over all entries of the reactive object (array or object)
        if (Array.isArray(this.value)) {
            this.value.forEach((_) => {
                if (typeof _ === 'object') {
                    this.watchAllKeysOfAnObject(_, callback);
                }
            });
        } else if (typeof this.value === 'object' && this.value !== null) {
            this.watchAllKeysOfAnObject(this.value, callback);
        }

        // Watch array mutations
        if (Array.isArray(this.value)) {
            this.watch('push', callback);
            this.watch('pop', callback);
            this.watch('splice', callback);
            this.watch('shift', callback);
            this.watch('unshift', callback);
        }
    }

}

export { reactive, tag, inlineStyleStringFromJSON, img, input, for$ };