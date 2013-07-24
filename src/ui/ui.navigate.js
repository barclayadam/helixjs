hx.config(['$router'], function($router) {
    ko.utils.registerEventHandler(document, 'click', function(event) {
        if(event.target.tagName === 'A') {
            var element = event.target,
                match = ko.utils.domData.get(element, '__matchedRoute');

            if(match) {
                $router.navigateTo(match.route.name, match.parameters);

                if (event.preventDefault)
                    event.preventDefault();
                else
                    event.returnValue = false;
            }
        }
    });

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
        init: function(element, valueAccessor) {            
            var routeName = ko.utils.unwrapObservable(valueAccessor());

            $router.current.subscribe(function(current) {
                ko.utils.toggleDomNodeCssClass(element, 'active', current.route.name === routeName);
            })
        },

        update: function(element, valueAccessor, allBindingsAccessor) {
            var routeName = ko.utils.unwrapObservable(valueAccessor()),
                parameters = allBindingsAccessor()['parameters'];
                match = $router.buildMatchedRoute(routeName, parameters);

            if(match) {
                element.setAttribute('href', match.url);
                
                ko.dependencyDetection.ignore(function() {
                    match.authorise()
                         .fail(function() {
                            element.style.display = "none";
                        })
                });
            } else {                
                element.setAttribute('href', '#');
            }
            
            ko.utils.domData.set(element, '__matchedRoute', match);
        }
    }
});