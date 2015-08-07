(function() {
    var labels, rules;

    function hasValue(value) {
        return (value != null) && (!value.replace || value.replace(/[ ]/g, '') !== '');
    };

    function emptyValue(value) {
        return !hasValue(value);
    };

    function withoutTime(dateTime) {
        if (dateTime != null) {
            return new Date(dateTime.getYear(), dateTime.getMonth(), dateTime.getDate());
        }
    };

    function today() {
        return withoutTime(new Date());
    };

    labels = document.getElementsByTagName('label');

    function getLabelFor(element) {
        return _.find(labels, function (l) {
            return l.getAttribute('for') === element.id;
        });
    };

    hx.validation.parseDate = function(value) {
        if (_.isDate(value)) {
            return value;
        }

        if (typeof moment == 'function') {
            var asMoment = moment(value);

            if(asMoment.isValid()) {
                return asMoment.toDate();
            }
        }        
    }

    hx.validation.rules = rules = {
        required: {
            validator: function (value, options) {
                return hasValue(value);
            },

            message: "This field is required",

            modifyElement: function (element, options) {
                var label = getLabelFor(element);

                element.setAttribute("aria-required", "true");
                element.setAttribute("required", "required");
               
                if (label) {
                    ko.utils.toggleDomNodeCssClass(label, 'required', true);
                }
            }
        },

        regex: {
            validator: function (value, options) {
                return (emptyValue(value)) || (options.test(value));
            },

            message: "This field is invalid",

            modifyElement: function (element, options) {
                element.setAttribute("pattern", "" + options);
            }
        },

        numeric: {
            validator: function (value, options) {
                return (emptyValue(value)) || (isFinite(value));
            },

            message: function (options) {
                return "This field must be numeric";
            },

            modifyElement: function (element, options) {
                try {
                    element.setAttribute("type", 'number');
                } catch (e) {
                    // IE8: Ignore this as it does not support changing the number type
                }
            }
        },

        integer: {
            validator: function (value, options) {
                return (emptyValue(value)) || (/^[0-9]+$/.test(value));
            },

            message: "This field must be a whole number",

            modifyElement: function (element, options) {
                try {
                    element.setAttribute("type", 'number');
                } catch (e) {
                    // IE8: Ignore this as it does not support changing the number type
                }
            }
        },

        exactLength: {
            validator: function (value, options) {
                return (emptyValue(value)) || ((value.length != null) && value.length === options);
            },

            message: function (options) {
                return "This field must be exactly " + options + " characters long";
            },

            modifyElement: function (element, options) {
                element.setAttribute("maxLength", options);
            }
        },

        minLength: {
            validator: function (value, options) {
                return (emptyValue(value)) || ((value.length != null) && value.length >= options);
            },

            message: function (options) {
                return "This field must be at least " + options + " characters long";
            }
        },

        maxLength: {
            validator: function (value, options) {
                return (emptyValue(value)) || ((value.length != null) && value.length <= options);
            },

            message: function (options) {
                return "This field must be no more than " + options + " characters long";
            },

            modifyElement: function (element, options) {
                element.setAttribute("maxLength", options);
            }
        },

        rangeLength: {
            validator: function (value, options) {
                return (rules.minLength.validator(value, options[0])) && (rules.maxLength.validator(value, options[1]));
            },

            message: function (options) {
                return "This field must be between " + options[0] + " and " + options[1] + " characters long";
            },

            modifyElement: function (element, options) {
                element.setAttribute("maxLength", "" + options[1]);
            }
        },

        min: {
            validator: function (value, options) {
                return emptyValue(value) || parseFloat(value) >= parseFloat(ko.unwrap(options));
            },

            message: function (options) {
                return "This field must be equal to or greater than " + ko.unwrap(options);
            },

            modifyElement: function (element, options) {
                element.setAttribute("min", ko.unwrap(options));
                element.setAttribute("aria-valuemin", ko.unwrap(options));
            }
        },

        moreThan: {
            validator: function (value, options) {
                return emptyValue(value) || parseFloat(value) > parseFloat(options);
            },

            message: function (options) {
                return "This field must be greater than " + ko.unwrap(options) + ".";
            }
        },

        max: {
            validator: function (value, options) {
                return emptyValue(value) || parseFloat(value) <= parseFloat(ko.unwrap(options));
            },

            message: function (options) {
                return "This field must be equal to or less than " + ko.unwrap(options);
            },

            modifyElement: function (element, options) {
                element.setAttribute("max", ko.unwrap(options));
                return element.setAttribute("aria-valuemax", ko.unwrap(options));
            }
        },

        lessThan: {
            validator: function (value, options) {
                return emptyValue(value) || parseFloat(value) < parseFloat(ko.unwrap(options));
            },

            message: function (options) {
                return "This field must be less than " + ko.unwrap(options) + ".";
            }
        },

        range: {
            validator: function (value, options) {
                return rules.min.validator(value, ko.unwrap(options)[0]) && rules.max.validator(value, ko.unwrap(options)[1]);
            },

            message: function (options) {
                return "This field must be between " + ko.unwrap(options)[0] + " and " + ko.unwrap(options)[1];
            },

            modifyElement: function (element, options) {
                rules.min.modifyElement(element, ko.unwrap(options)[0]);
                return rules.max.modifyElement(element, ko.unwrap(options)[1]);
            }
        },

        maxDate: {
            validator: function (value, options) {
                return (emptyValue(value)) || (hx.validation.parseDate(value) <= hx.validation.parseDate(options));
            },

            message: function (options) {
                return "This field must be on or before " + options[0];
            }
        },
        
        minDate: {
            validator: function (value, options) {
                return (emptyValue(value)) || (hx.validation.parseDate(value) >= hx.validation.parseDate(options));
            },

            message: function (options) {
                return "This field must be on or after " + options[0];
            }
        },

        inFuture: {
            validator: function (value, options) {
                if (options === "Date") {
                    return (emptyValue(value)) || (withoutTime(hx.validation.parseDate(value)) > today());
                } else {
                    return (emptyValue(value)) || (hx.validation.parseDate(value) > new Date());
                }
            },

            message: "This field must be in the future"
        },

        inPast: {
            validator: function (value, options) {
                if (options === "Date") {
                    return (emptyValue(value)) || (withoutTime(hx.validation.parseDate(value)) < today());
                } else {
                    return (emptyValue(value)) || (hx.validation.parseDate(value) < new Date());
                }
            },

            message: "This field must be in the past"
        },

        notInPast: {
            validator: function (value, options) {
                if (options === "Date") {
                    return (emptyValue(value)) || (withoutTime(hx.validation.parseDate(value)) >= today());
                } else {
                    return (emptyValue(value)) || (hx.validation.parseDate(value) >= new Date());
                }
            },

            message: "This field must not be in the past"
        },

        notInFuture: {
            validator: function (value, options) {
                if (options === "Date") {
                    return (emptyValue(value)) || (withoutTime(hx.validation.parseDate(value)) <= today());
                } else {
                    return (emptyValue(value)) || (hx.validation.parseDate(value) <= new Date());
                }
            },

            message: "This field must not be in the future"
        },

        requiredIf: {
            validator: function (value, options) {
                var valueToCheckAgainst, valueToCheckAgainstInList;

                if (options.equalsOneOf === void 0) {
                    throw new Error("You need to provide a list of items to check against.");
                }

                if (options.value === void 0) {
                    throw new Error("You need to provide a value.");
                }

                valueToCheckAgainst = ko.unwrap(options.value);
                valueToCheckAgainstInList = options.equalsOneOf.some(function (v) {
                    return v === valueToCheckAgainst;
                });

                if (valueToCheckAgainstInList) {
                    return hasValue(value);
                } else {
                    return true;
                }
            },

            message: "This field is required"
        },

        requiredIfNot: {
            validator: function (value, options) {
                var valueToCheckAgainst, valueToCheckAgainstNotInList;

                if (options.equalsOneOf === void 0) {
                    throw new Error("You need to provide a list of items to check against.");
                }

                if (options.value === void 0) {
                    throw new Error("You need to provide a value.");
                }

                valueToCheckAgainst = ko.unwrap(options.value);
                valueToCheckAgainstNotInList = options.equalsOneOf.every(function (v) {
                    return v !== valueToCheckAgainst;
                });

                if (valueToCheckAgainstNotInList) {
                    return hasValue(value);
                } else {
                    return true;
                }
            },
            message: "This field is required"
        },

        equalTo: {
            validator: function (value, options) {
                return (emptyValue(value)) || (value === ko.utils.unwrapObservable(options));
            },

            message: function (options) {
                return "This field must be equal to " + options + ".";
            }
        },

        custom: {
            validator: function (value, options) {
                if (!_.isFunction(options)) {
                    throw new Error("Must pass a function to the 'custom' validator");
                }
                
                return options(value);
            },

            message: "This field is invalid."
        }
    };

    function defineRegexValidator(name, regex) {
        rules[name] = {
            validator: function (value, options) {
                return rules.regex.validator(value, regex);
            },

            message: "This field is an invalid " + name,

            modifyElement: function (element, options) {
                rules.regex.modifyElement(element, regex);
            }
        };
    };

    defineRegexValidator('email', /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i);

    defineRegexValidator('postcode', /(GIR ?0AA)|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) ?[0-9][A-Z]{2})/i);
}());