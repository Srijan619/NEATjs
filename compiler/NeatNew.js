export function tag(name, ...children) {
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
        if (isObject(value) && name === "style") {
            // JSON style to inline style formatting
            value = formatStyleFromJSON(value);
        }
        if (isReactive(value)) {
            // Set reactive values properly
            value = value.__value;
        }
        this.setAttribute(name, value);
        return this;
    };

    // Two way binding to element (i.e data + input listener)
    // Receives reactiveValue
    // attribute (what to patch, "value" always as these are for input elements only)
    // and a callback which is null by default
    result.tuneIn$ = function (val, callback) {
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
            });
        });

        return this;
    };

    result.onclick$ = function (callback) {
        this.onclick = callback;
        return this;
    };

    result.oninput$ = function (callback) {
        this.oninput = callback;
        return this;
    };

    result.onchange$ = function (callback) {
        this.onchange = callback;
        return this;
    };

    return result;
}

// Example of other utility functions and constants
export const isObject = (val) => typeof val === 'object' && val !== null;
export const isReactive = (val) => val && typeof val.__value !== 'undefined';
export const reactive = (val) => {
    // Implement reactive function
};

// Add other functions and constants that you need to export

// Assume that these functions exist and are implemented elsewhere
export const formatStyleFromJSON = (style) => {
    // Implement style formatter
};

export const patchAndUpdate = (element, val, attr, callback) => {
    // Implement patch and update logic
};
