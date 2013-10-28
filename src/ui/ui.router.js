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
hx.bindingHandler('router', ['$bus'], function($bus) {
    return {
        tag: 'router',

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            $bus.subscribe('routeNavigated', function(msg) {
                if (msg.route.options.templateName) {
                    koBindingHandlers.component.update(element, function() { return { templateName: msg.route.options.templateName }; }, allBindingsAccessor, viewModel, bindingContext);
                } else if (msg.route.options.component) {
                    koBindingHandlers.component.update(element, function() { return msg.route.options.component; }, allBindingsAccessor, viewModel, bindingContext);
                } else {                    
                    koBindingHandlers.component.update(element, function() { return null; }, allBindingsAccessor, viewModel, bindingContext);
                }
            });

            return koBindingHandlers.component.init(element);
        }
    };
});