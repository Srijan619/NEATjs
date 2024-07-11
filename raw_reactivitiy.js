
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
            set(obj, prop, value, receiver) {
                if (!obj.hasOwnProperty(prop)) return false; // Exit early if property doesn't exist
                const oldValue = obj[prop];
                // Use Reflect.set to set the property value
                const success = Reflect.set(obj, prop, value, receiver);

                // Notify change if the value actually changed
                if (success && oldValue !== value) {
                    self._notify(prop);
                }

                // If the new value is an object, make it reactive
                if (typeof value === 'object' && value !== null && !value.__isProxy) {
                    value.__isProxy = true; // Tag the proxy to prevent double-wrapping
                    obj[prop] = self._createProxy(value);
                }

                return success;
            },
            get(obj, prop) {
                // Handle native array methods that modify the array
                if (Array.isArray(obj) && typeof obj[prop] === 'function') {
                    return function (...args) {
                        const result = Array.prototype[prop].apply(obj, args);
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