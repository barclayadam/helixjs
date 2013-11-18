/**
 * A binding handler that given a value will add classes and attributes that allow styling
 * to indicate that the bound input has content.
 *
 * This binding handler will automatically handle `input`and `textarea` elements using
 * the `value` binding handler.
 *
 * A `has-content` class will be added to the element once it has been marked as having content, allowing
 * styling to target only those input fields that have been marked as having content (e.g. a form
 * input that uses async validation).
 */
hx.bindingHandler('hasContent', {
    tag: ['input', 'textarea'],

    update: function(element, valueAccessor, allBindingsAccessor) {
        var passedValue = valueAccessor(),
            value = passedValue === true ? allBindingsAccessor.get('value') : passedValue

        ko.utils.toggleDomNodeCssClass(element, 'has-content', ko.utils.unwrapObservable(value));
    }
});