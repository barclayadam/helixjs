hx.config(function() {
    /**
     * A binding handler that is not designed to be used directly but instead will attach itself
     * to form input elements (input, select, textarea) and, if a `value` binding has been specified
     * that refers to a validated observable, updated classes and attributes that allow styling
     * to indicate validation status.
     *
     * An `aria-invalid` attribute will be immediately added and kept up-to-date with the
     * `isValid` property of the observable
     *
     * A `validated` class will be added to the element once it has been marked as validated, allowing
     * styling to target only those input fields that have been marked as validated (e.g. once a form
     * has been submitted).
     */
    koBindingHandlers.inputValidationClass = {
        tag: ['input', 'select', 'textarea'],

        update: function(element, valueAccessor, allBindingsAccessor) {
            var value = allBindingsAccessor()['value'];

            if (value && value.isValid) {
                element.setAttribute('aria-invalid', !value.isValid());

                ko.utils.toggleDomNodeCssClass(element, 'validated', value.validated());
                ko.utils.toggleDomNodeCssClass(element, 'is-validating', value.validating());
            }

            if (value && value.validationRules) {
                _.each(value.validationRules(), function(options, key) {
                    var rule = hx.validation.rules[key];

                    if(rule && rule.modifyElement) {
                        rule.modifyElement(element, options);
                    }
                })
            }
        }
    }

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
    koBindingHandlers.validationMessage = {
        tag: 'validationMessage->span',

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
                var isValid = value.isValid() && value.serverErrors().length === 0;

                ko.utils.toggleDomNodeCssClass(element, 'valid', isValid);
                ko.utils.toggleDomNodeCssClass(element, 'invalid', !isValid);
                ko.utils.toggleDomNodeCssClass(element, 'validated', value.validated());
                ko.utils.toggleDomNodeCssClass(element, 'is-validating', value.validating());

                if(isValid) {
                    ko.utils.emptyDomNode(element);
                } else {
                    var errorText = ko.utils.domData.get(element, '__validation_message') ||
                                    value.errors().concat(value.serverErrors()).join("<br />");

                    ko.utils.setTextContent(element, errorText);
                }
            } else {
                ko.utils.emptyDomNode(element);
            }
        }
    }
});