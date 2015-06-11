(function() {
    // Test taken from Modernizr: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
    function isLocalStorageSupported() {
        var mod = 'hx';

        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    }

    if (!isLocalStorageSupported()) {
        "local session".replace(/\w+/g, function (type) {
            ko.extenders[type + 'Storage'] = function (target, key) {
                // No-op required to maintain the same interface as supported scenario.
                target.store = function() {};

                return target;
            };
        });
    } else {
        // Creates observable extenders for both `local` and `session` storage.

        // The storage extenders handle the conversion from and to a string for
        // any data type stored (including object literals), as the underlying
        // storage mechanism (as defined by the `HTML5` spec) does not perform
        // storage of any 'complex' data type.
        "local session".replace(/\w+/g, function (type) {
            ko.extenders[type + 'Storage'] = function (target, key) {
                function store(newValue) {
                    if (newValue !== undefined) {
                        window[type + 'Storage'].setItem(key, JSON.stringify({
                            value: newValue
                        }));
                    } else {
                        window[type + 'Storage'].removeItem(key);
                    }
                }

                var stored = window[type + 'Storage'].getItem(key);
                
                if (stored != null && ko.isWriteableObservable(target)) {
                    target((JSON.parse(stored)).value);
                }

                // Automatically store new value to storage (will only work if
                // support is enabled)
                target.subscribe(store);

                // Force the current value to be stored, useful for when the value
                // is initialised but not changed and you want value to be exposed
                // in DevTools
                target.store = function() {
                    store(target());
                };

                return target;
            };
        });
    }
}());