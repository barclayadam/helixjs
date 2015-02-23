/**
 * @bindingHandler router
 * @tagReplacement div
 *
 * # Overview
 *
 * A key component of any `HelixJS` application, the `router` binding handler
 * is responsible for taking routes that have been navigated to and rendering the
 * `component` that has been configured for the route using the `component` binding
 * handler and composition system.
 */
hx.bindingHandler('router', ['$bus', '$router'], function($bus, $router) {
    return {
        tag: 'router',

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            function render(options) {
                koBindingHandlers.component.update(
                    element, 
                    function() { return options; }, 
                    allBindingsAccessor, 
                    viewModel, 
                    bindingContext);
            }

            $bus.subscribe('routeNavigated', function(msg) {
                if (msg.route.options.templateName) {
                    render({ templateName: msg.route.options.templateName });
                } else if (msg.route.options.component) {
                    render(msg.route.options.component);
                } else {                    
                    render(null);
                }
            });

            $bus.subscribe('unauthorisedRoute', function() {
                if ($router.unauthorisedComponent) {
                    render($router.unauthorisedComponent);
                } else if($router.unauthorisedTemplate) {
                    render({ templateName: $router.unauthorisedTemplate });
                }
            });

            $bus.subscribe('routeNotFound', function() {
                if ($router.routeNotFoundComponent) {
                    render($router.routeNotFoundComponent);
                } else if($router.routeNotFoundTemplate) {
                    render({ templateName: $router.routeNotFoundTemplate });
                }
            });

            return koBindingHandlers.component.init(element);
        }
    };
});

ko.virtualElements.allowedBindings['router'] = true;