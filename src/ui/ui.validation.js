/**
 * A binding handler that given a validated observable will add classes and attributes that allow styling
 * to indicate validation status.
 *
 * This binding handler will automatically handle `input`, `select` and `textarea` elements using
 * the `value` binding handler if it refers to a validated observable.
 *
 * An `aria-invalid` attribute will be immediately added and kept up-to-date with the
 * `isValid` property of the observable
 *
 * A `validated` class will be added to the element once it has been marked as validated, allowing
 * styling to target only those input fields that have been marked as validated (e.g. once a form
 * has been submitted).
 */
hx.bindingHandler('validated', {
    tag: ['input', 'select', 'textarea'],

    update: function(element, valueAccessor, allBindingsAccessor) {
        var passedValue = valueAccessor(),
            validatedObservable = passedValue === true ? allBindingsAccessor.get('value') : passedValue;

        if (validatedObservable) {
            if (validatedObservable.isValid) {
                element.setAttribute('aria-invalid', '' + !validatedObservable.isValid());

                ko.utils.toggleDomNodeCssClass(element, 'validated', validatedObservable.validated());
                ko.utils.toggleDomNodeCssClass(element, 'is-validating', validatedObservable.validating());
            }

            if (validatedObservable.validationRules) {
                _.each(validatedObservable.validationRules(), function(options, key) {
                    var rule = hx.validation.rules[key];

                    if(rule && rule.modifyElement) {
                        rule.modifyElement(element, options);
                    }
                })
            }
        }
    }
});

/**
 * A binding handler that can either be applied to an element or used as the custom
 * tag `<validationMessage>` to output error messages that have been added to a specified
 * validatable observable.
 *
 * The element will have a `validation-message` class immediately added if the observable
 * specified is a validatable observable.
 *
 * Once an observable has been validated a `validated` class will be added to the element.
 * This is typically used to allow the showing of error messages only after a form has been
 * validated once.
 *
 * If an observable is marked as valid ({@link hx.validatable.validated}), a `valid` class
 * will be added, otherwise an `invalid` class will be added.
 *
 * The error messages that are shown are those that are added by the validation subsystem,
 * defined either by the rules as defaults or overriden when defining those rules. It is
 * possible to override the message that is shown by supplying text within the element
 * when it is being bound. If text is found that will override *all* error messages and
 * will be the only thing shown when the observable is not valid.
 */
hx.bindingHandler('validationMessage', {
    tag: 'validationMessage',

    init: function(element, valueAccessor) {
        var value = valueAccessor(),
            overrideMessage = element.innerText || element.textContent;

        if(overrideMessage) {
            ko.utils.domData.set(element, '__validation_message', overrideMessage);
        }

        if(value && value.isValid) {
            ko.utils.toggleDomNodeCssClass(element, 'validation-message', true);                
        }
    },

    update: function(element, valueAccessor) {
        var value = valueAccessor();

        if(value && value.isValid) {
            var allErrors = _.filter(value.errors().concat(value.serverErrors()), function (x) { return x; }),
                isValid = allErrors.length === 0;

            ko.utils.toggleDomNodeCssClass(element, 'valid', isValid);
            ko.utils.toggleDomNodeCssClass(element, 'invalid', !isValid);
            ko.utils.toggleDomNodeCssClass(element, 'validated', value.validated());
            ko.utils.toggleDomNodeCssClass(element, 'is-validating', value.validating());

            if (isValid) {
                ko.utils.setTextContent(element, 'Valid');
            } else {
                var customErrorMessage = ko.utils.domData.get(element, '__validation_message');
            
                if (customErrorMessage) {
                    element.innerHTML = customErrorMessage;
                } else if (allErrors.length === 0) {
                    element.innerHTML = 'Valid';
                } else {
                    element.innerHTML = allErrors.join('<br />');
                }
            }
        } else {
            ko.utils.emptyDomNode(element);
        }
    }
});