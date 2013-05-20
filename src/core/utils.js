/** 
 * @class utils 
 * @static
 */
hx.utils = {
    toTitleCase: function (str, insertSpaces) {
        if (str != null) {
            var spaceDelimiter = insertSpaces !== false ? ' ' : '';

            function convertWord(match) {
                // If 'word' matched is only an acronym perform no processing

                if (match.toUpperCase() === match) {
                    return match;
                } else {
                    // insert a space between lower & upper / numbers
                    match = match.replace(/([a-z])([A-Z0-9])/g, function (_, one, two) {
                        return one + spaceDelimiter + two;
                    }); 

                    // space before last upper in a sequence followed by lower
                    match = match.replace(/\b([A-Z]+)([A-Z])([a-z])/, function (_, one, two, three) {
                        return one + spaceDelimiter + two + three;
                    });

                    // uppercase the first character
                    return match.replace(/^./, function (s) {
                        return s.toUpperCase();
                    });
                }
            };

            return str.toString().replace(/\b[a-zA-Z0-9]+\b/g, convertWord);
        }
    },

    toCamelCase: function (str, insertSpaces) {
        if (str != null) {
            return hx.utils.toTitleCase(str, insertSpaces).replace(/^./, function (s) {
                return s.toLowerCase();
            });
        }
    },

    toSentenceCase: function (str) {
        if (str != null) {
            function convertWord (match) {
                // If 'word' matched is only an acronym perform no processing
                if (match.toUpperCase() === match) {
                    return match;
                } else {
                    // Handle sentence ending with acronym
                    match = match.replace(/([A-Z]{2,})([A-Z])$/g, function (_, one, two) {
                        return " " + one + two;
                    });

                    // Separate out acronyms first
                    match = match.replace(/([A-Z]{2,})([A-Z])([^$])/g, function (_, one, two, three) {
                        return " " + one + " " + (two.toLowerCase()) + three;
                    });

                    // insert a space between lower & upper   
                    match = match.replace(/([a-z])([A-Z0-9])/g, function (_, one, two) {
                        return one + " " + (two.toLowerCase());
                    });

                    // lowercase the first character
                    match = match.replace(/^./, function (s) {
                        return s.toLowerCase();                        
                    });

                    return match;
                }
            };
            
            str = str.toString();
            str = str.replace(/\b[a-zA-Z0-9]+\b/g, convertWord);
            str = str.replace(/^./, function (s) {
                return s.toUpperCase();
            });

            return str;
        }
    },

    /**
     * Given a value will convert it to an observable, using the following rules:
     * 
     * * If `value` is already an observable (`ko.isObservable`), return it directly
     * * If `value` is an array, return a `ko.observableArray` initialised with the value
     * * For all other cases (including `undefined` or `null` values) return a `ko.observable` initialised with the value
     *
     * @method asObservable
     * @static
     *
     * @param {any} value The value to be converted to an observable
     */
    asObservable: function (value, context) {
        if (ko.isObservable(value)) {
            return value;
        }
        
        if (_.isArray(value)) {
            return ko.observableArray(value);
        } else if (_.isFunction(value)) {
            return ko.computed(value.bind(context || this));
        } else {
            return ko.observable(value);
        }
    },

    /**
     * Given a value will convert it into a promise, converting static values into an
     * already resolved promise to allow boilerplate code to be cut in functions that
     * handle both a static return value and promise-based returns, and returning
     * existing promises / deferred as-is.
     *
     * @method asPromise
     * @static
     *
     * @param {any} value - The value to convert to a promise.
     *
     * @return {promise} - A promise, either the one passed in or an already resolved one
     *  that has been resolved with the given static value
     */
    asPromise: function(value) {
        if(value && value.then) {
            return value;
        } else {
            var deferred = new $.Deferred();
            deferred.resolve(value)

            return deferred;
        }
    }
};