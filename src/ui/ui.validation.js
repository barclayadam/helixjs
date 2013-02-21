hx.provide('$validationBindingHandlers', hx.instantiate(function() {
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
            }

            if (value && value.validationRules) {
                _.each(value.validationRules(), function(options, key) {
                    if(hx.validation.rules[key].modifyElement) {
                        hx.validation.rules[key].modifyElement(element, options);
                    }
                })
            }
        }
    }
}));