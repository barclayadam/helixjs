// Creates observable extenders for both `local` and `session` storage.

// The storage extenders handle the conversion from and to a string for
// any data type stored (including object literals), as the underlying
// storage mechanism (as defined by the `HTML5` spec) does not perform
// storage of any 'complex' data type.
"local session".replace(/\w+/g, function (type) {
    ko.extenders[type + 'Storage'] = function (target, key) {
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

        return target;
    };
});