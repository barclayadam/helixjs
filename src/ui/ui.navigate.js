hx.config(['$router'], function($router) {

    /**
     * @bindingHandler navigate
     *
     * The navigate binding handler provides inter-page navigation. This binding
     * handler will typically be applied to an `a` tag, although can be applied to
     * any element as it will handle the click event on the element, it does not
     * depend on the browsers built-in linking functionality.
     *
     * The binding handler takes a single parameter, the name of the route that
     * should be navigated to, being a named route that has been registered in the
     * global $router module.
     *
     * If the route requires parameters then they can be provided by using the
     * `parameters` binding handler, which accepts an object of parameters to
     * be used to generate the URL and when navigating.
     *
     * @example
     *
     * <a data-bind="navigate: 'View User', parameters: { userId: 4 }>View User 4</a>"
     */
    koBindingHandlers.navigate = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var routeName = ko.utils.unwrapObservable(valueAccessor()),
                parameters = allBindingsAccessor()['parameters'];

            ko.utils.registerEventHandler(element, 'click', function(event) {
                $router.navigateTo(routeName, parameters);

                if (event.preventDefault)
                    event.preventDefault();
                else
                    event.returnValue = false;
            })
        },

        update: function(element, valueAccessor, allBindingsAccessor) {
            var routeName = ko.utils.unwrapObservable(valueAccessor()),
                parameters = allBindingsAccessor()['parameters'];
                url = $router.buildUrl(routeName, parameters);

            element.setAttribute('href', url);
        }
    }
});