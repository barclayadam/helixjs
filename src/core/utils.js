hx.utils = {
    toTitleCase: function (str) {
        if (str != null) {
            function convertWord(match) {
                // If 'word' matched is only an acronym perform no processing

                if (match.toUpperCase() === match) {
                    return match;
                } else {
                    // insert a space between lower & upper / numbers
                    match = match.replace(/([a-z])([A-Z0-9])/g, function (_, one, two) {
                        return one + " " + two;
                    }); 

                    // space before last upper in a sequence followed by lower
                    match = match.replace(/\b([A-Z]+)([A-Z])([a-z])/, function (_, one, two, three) {
                        return one + " " + two + three;
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
     Given a value will convert it to an observable, using the following rules:
     
     * If `value` is already an observable (`ko.isObservable`), return it directly
     * If `value` is an array, return a `ko.observableArray` initialised with the value
     * For all other cases (including `undefined` or `null` values) return a `ko.observable` initialised with the value
    */
    asObservable: function (value) {
        if (ko.isObservable(value)) {
            return value;
        }
        
        if (_.isArray(value)) {
            return ko.observableArray(value);
        } else {
            return ko.observable(value);
        }
    }
};