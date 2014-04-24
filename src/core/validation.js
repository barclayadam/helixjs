var validation,
    __hasProp = {}.hasOwnProperty;

validation = hx.validation = {};

/**
 A function that is given a chance to format an error message
 that has been generated for any validation failures. This
 is provided to allow calling formatters such as `toSentenceCase`
 to produce better default messages.

 This function will take a single `string` parameter and should
 return a `string` to use as the error message.
*/
validation.formatErrorMessage = function (msg) {
    return msg;
};

function getMessageCreator (propertyRules, ruleName) {
    return propertyRules[ruleName + "Message"] || hx.validation.rules[ruleName].message || "The field is invalid";
};

// Validates the specified 'model'.
//
// If the model has `validationRules` defined (e.g. a `validatable` observable) 
// will validate those values.
function validateModel (model, includedProperties) {
    var validationPromises = [];

    // Unwrap the passed in model - will handle observables wrapped in
    // other observables by ignoring intermediate observables
    while (ko.isObservable(model)) {
      model = model.peek();
    }    

    if (model) {
        if (_.isObject(model)) {
            for (var propName in model) {
                if (!__hasProp.call(model, propName)) continue;
                if (includedProperties && !_.contains(includedProperties, propName)) continue

                var propValue = model[propName];

                // We have reached a property that has been marked as `validatable`
                if (propValue && propValue.validate && propValue.validationRules != null) {
                    // We only want to be dependent on isValid, not the actual value or
                    // any any other value.
                    ko.dependencyDetection.ignore(function() {
                        validationPromises.push(propValue.validate());
                    });

                    // Add a dependency to isValid to force update of model on
                    // value change.
                    propValue.isValid();
                }

                validationPromises.push(validateModel(propValue));
            }
        } else if (_.isArray(model)) {
            for (var i = 0; i < model.length; i++) {
                validationPromises.push(validateModel(model[i]));
            }
        }
    }
    
    if (validationPromises.length === 0) {
        return Promise.resolve(true);
    }

    return Promise.all(validationPromises)
        .then(function(validationResults) {
            return _.every(validationResults, function(r) { return r === true; });
        });
}

/**
 Exposed as `hx.validation.mixin`

 Given a model will make it 'validatable', such that a call to
 the mixed-in `validate` method will validate the model and its
 children (properties) against a defined set of rules, rules that
 are defined at an observable property level using the `validated`
 observable extender.

 When a model is validated all child properties and arrays will be 
 navigated to check for validation rules, both observable and
 non-observable values, although only observable properties will
 have validation rules specified against them.
*/
validation.mixin = function (model, includedProperties) {
    var lastValidationPromise;

    /**
     Validates this model against the currently-defined set of
     rules (against the child properties), setting up dependencies
     on all propertes of this model to update the set of errors
     and `isValid` state should any property change.
    
     The model of executing `validate` only once to set-up the
     dependencies is to allow filling in a form completely
     before checking validity to avoid errors being shown
     immediately, but then allowing any errors detected to be removed
     on property change immediately instead of having to attempt
     a resubmit and a validate.
    */
    model.validate = function () {
        // Only create a computed once, which will then keep
        // the `isValid` property up-to date whenever a value
        // of this model and its children changes.
        if (!model.validated()) {
            ko.computed(function () {
                model.validating(true);

                lastValidationPromise = validateModel(model, includedProperties)

                lastValidationPromise.then(function(isValid) {
                    model.isValid(isValid);

                    model.validating(false);
                });
            });

            model.validated(true);
        }
        
        // Whenever a model is explicitly validated the server errors
        // of the model will be reset, as it would not be possible to
        // determine validity of the model until going back to the server.
        model.serverErrors([]);

        return lastValidationPromise;
    };
    
    model.validating = ko.observable(false);

    /**
     An observable that indicates whether this model has been validated,
     set to `true` when the `validate` method of this method has been 
     called at least once.
    */
    model.validated = ko.observable(false);

    /*
     An observable that indicates whether or not this model is
     considered 'valid' on the client side, which is defined as having no
     `client-side` validation errors.
    
     A model may have `serverErrors` that, as they can only be
     checked server-side, are not considered when dealing with
     the validitiy of a model as this value is used when determining
     whether to even submit a form / command for processing by the
     server.
    */
    model.isValid = ko.observable();

    /** 
     An observable that will contain an array of error messages
     that apply to the model as a whole but are not considered when
     determining the `isValid` state of this form (e.g. it would not
     stop the posting of a form to the server).
    */
    model.serverErrors = ko.observable([]);

    /**
     Sets any server validation errors, errors that could not be checked client
     side but mean the action attempted failed. These server errors are not considered
     when determining the `isValid` state of a form, but are instead for
     informational purposes.
    
     The `errors` argument is an object that contains property name to server errors
     mappings, with all unknown property errors being flattened into a single
     list within this model.
    */
    model.setServerErrors = function (errors) {
        var key, value;

        for (key in model) {
            if (!__hasProp.call(model, key)) continue;

            value = model[key];

            if (value && value.serverErrors) {
                if(errors[key]) {
                    value.serverErrors(_.flatten([errors[key]] || []));
                    delete errors[key];
                }
            }
        }

        model.serverErrors(_.flatten(_.values(errors)));
    };

    return model;
};

validation.newModel = function (model) {
    if (model == null) {
        model = {};
    }
    validation.mixin(model);
    return model;
};

/**
 Defines the set of validation rules that this observable must follow
 to be considered `valid`.

 The observable will be extended with:
  * `errors` -> An observable that will contain an array of the errors of the observable
  * `isValid` -> An observable value that identifies the value of the observable as valid
                 according to its errors
  * `validationRules` -> The rules passed as the options of this extender, used in the validation
                         of this observable property.
*/
ko.extenders.validationRules = function (target, validationRules) {
    var lastValidationPromise;

    if (validationRules == null) {
        validationRules = {};
    }

    // We are adding rules to an already validatable property, just extend
    // its validation rules.
    if (target.validationRules != null) {
        target.validationRules(_.extend(target.validationRules(), validationRules));
        return;
    }

    target.validationRules = ko.observable(validationRules);

    target.validate = function () {
        target.validated(true);

        return lastValidationPromise;
    };

    target.validating = ko.observable(false);

    // An observable that indicates whether this property has been validated,
    // set to `true` when the `validate` method of this method has been 
    // called at least once.
    target.validated = ko.observable(false);
    
    target.errors = ko.observable([]);
    target.isValid = ko.observable(true);

    // An observable that will contain an array of error messages
    // that apply to this property but are not considered when
    // determining the `isValid` state of this property (e.g. it would not
    // stop the posting of a form to the server).
    target.serverErrors = ko.observable([]);
    
    function handleValidationResult(isValid, ruleName, ruleOptions, errors) {
        if (!isValid) {
            var msgCreator = getMessageCreator(target.validationRules(), ruleName);

            if (_.isFunction(msgCreator)) {
                errors.push(validation.formatErrorMessage(msgCreator(ruleOptions)));
            } else {
                errors.push(validation.formatErrorMessage(msgCreator));
            }
        }
    }

    ko.computed(function() {
        if (ko.isObservable(target())) {
            throw new Error('Cannot set an observable value as the value of a validated observable');
        }

        target.validating(true);

        // When this value is changed the server errors will be removed, as
        // there would be no way to identify whether they were still accurate
        // or not until re-submitted, so for user-experience purposes these
        // errors are removed when a user modifies the value.
        target.serverErrors([]);

        var currentErrors = [],
            asyncPromises = [],
            rules = target.validationRules(),
            value = target();

        for (var ruleName in rules) {
            (function(ruleName) {
                var ruleOptions = rules[ruleName],
                    rule = hx.validation.rules[ruleName];

                if (rule != null) {
                    var isValidOrPromise = rule.validator(value, ruleOptions);

                    if (isValidOrPromise && isValidOrPromise.then) {
                        // We are dealing with an async validator
                        asyncPromises.push(isValidOrPromise);

                        isValidOrPromise
                            .then(function(isValidResult) {
                                handleValidationResult(isValidResult, ruleName, ruleOptions, currentErrors);
                            })
                    } else {
                        handleValidationResult(isValidOrPromise, ruleName, ruleOptions, currentErrors);
                    }     
                }
            }(ruleName));           
        }

        lastValidationPromise = Promise.all(asyncPromises)
            .then(function() {
                target.errors(currentErrors);
                target.isValid(currentErrors.length === 0);

                target.validating(false);

                return currentErrors.length === 0;
            });
    });

    return target;
};

ko.subscribable.fn.addValidationRules = function (validationRules) {
    return ko.extenders.validationRules(this, validationRules);
};