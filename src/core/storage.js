(function() {
    var localStorageSupported = window['localStorage'] !== undefined,
        testKey = 'qeTest', 
        storage = window.sessionStorage; 

    // We need to test whether we could actually use localStorage. In Safari in private browsing
    // mode (local|window)Storage is available, but will throw a storage exception on any attempt at
    // using it.
    if (localStorageSupported) {
        try { 
            // Try and catch quota exceeded errors 
            window['localStorage'].setItem(testKey, '1'); 
            storage.removeItem(testKey); 
        } catch (error) { 
            if (typeof DOMException === 'undefined' || error.code === DOMException.QUOTA_EXCEEDED_ERR && storage.length === 0) {
                localStorageSupported = false;
            }
        }
    }

    // Creates observable extenders for both `local` and `session` storage.

    // The storage extenders handle the conversion from and to a string for
    // any data type stored (including object literals), as the underlying
    // storage mechanism (as defined by the `HTML5` spec) does not perform
    // storage of any 'complex' data type.
    "local session".replace(/\w+/g, function (type) {
        ko.extenders[type + 'Storage'] = function (target, key) {
            if (localStorageSupported) {
                var stored = window[type + 'Storage'].getItem(key);
                
                if (stored != null && ko.isWriteableObservable(target)) {
                    target((JSON.parse(stored)).value);
                }

                target.subscribe(function (newValue) {
                    if (newValue) {
                        window[type + 'Storage'].setItem(key, JSON.stringify({
                            value: newValue
                        }));
                    } else {
                        window[type + 'Storage'].removeItem(key);
                    }
                });
            }

            return target;
        };
    });
}());