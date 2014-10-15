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
hx.bindingHandler('navigate', ['$router', '$log'], function($router, $log) {
    ko.utils.registerEventHandler(document, 'click', function(event) {
        var element = event.target;

        do {        
            if (element.tagName === 'A' || element.tagName === 'BUTTON') {
                var match = ko.utils.domData.get(element, '__matchedRoute');

                if(match) {
                    $router.navigateTo(match.route.name, match.parameters);

                    if (event.preventDefault)
                        event.preventDefault();
                    else
                        event.returnValue = false;

                    return;
                }
            }

            element = element.parentNode;
        } while(element);
    });

    return {
        init: function(element, valueAccessor) {            
            var routeName = ko.utils.unwrapObservable(valueAccessor()),
                route = $router.getNamedRoute(routeName);

            if (!route) {
                $log.warn('Route "' + routeName + "' does not exist");
            } else {
                function update(current) {
                    if (current.route) {
                        ko.utils.toggleDomNodeCssClass(element, 'nav-active', current.route.name === routeName);
                        ko.utils.toggleDomNodeCssClass(element, 'sub-nav-active', current.url.indexOf(route.url) === 0);
                    } else {
                        ko.utils.toggleDomNodeCssClass(element, 'nav-active', false);
                        ko.utils.toggleDomNodeCssClass(element, 'sub-nav-active', false);
                    }
                }

                $router.current.subscribe(update);
                update($router.current());
            }
        },

        update: function(element, valueAccessor, allBindingsAccessor) {
            var routeName = ko.utils.unwrapObservable(valueAccessor()),
                parameters = allBindingsAccessor.get('parameters'),
                match = $router.buildMatchedRoute(routeName, parameters);

            if (match) {
                element.setAttribute('href', match.url);
                
                match.authorise().then(function (isAuthorised) {
                    var visibleBindingTrueOrMissing = !allBindingsAccessor.has('visible') || ko.unwrap(allBindingsAccessor.get('visible'));

                    if (isAuthorised && visibleBindingTrueOrMissing) {
                        element.style.display = "";
                    } else {
                        element.style.display = allBindingsAccessor.get('hideOnUnauthorised') === false ? '' :  'none';
                    }
                });
            } else {                
                element.setAttribute('href', '#');
            }
            
            ko.utils.domData.set(element, '__matchedRoute', match);
        }
    }
});