/**
 * @bindingHandler component
 * @tagReplacement div
 *
 * # Overview
 *
 * A key component of any `HelixJS` application, the `component` binding handler
 * is responsible for managing a section of a page, to provide simple
 * lifecycle management for showing `components`.
 *
 * A components is defined by a template (either named or anonymous) and a
 * `view model`, a view model being defined as nothing more than a 
 * simple object with optional methods and properties that can affect
 * the rendering and hook in to lifecycle management events.
 *
 * A components takes a single parameter, which is the `view model` that is to
 * be shown. If this property is an observable then if that observable is
 * updated the binding handler will `hide` the currently bound view model
 * and bind the new one and switch out the template.
 *
 * ## Lifecycle
 *              ┌──────────────────────────────┐
 * set region → │ → show → afterShow → hide →  │  → region unset 
 *              └──────────────────────────────┘
 *
 * The lifecycle hooks that the `region` binding handler provides are very
 * simple, providing no automatic management such as garbage collection or
 * unregistering events, it is the responsibility of the `view model`
 * itself to perform these actions, typically aided by using the `hx.ViewModel`
 * class and associated methods to provide more structure for view models.
 *
 * The above diagram demonstrates the lifecycle methods that, if found on the
 * `view model` will be invoked when this binding handler binds to it.
 *
 * Each method will be called in turn, as demonstrated above, with the following
 * behaviours for each:
 *
 * * `isAuthorised`: A component can determine whether or not the current user is
 *   authorized to view the component be defining an `isAuthorised` method that returns
 *   a boolean value (which may be a promise).
 *
 *   If this value is false then the component will not be rendered. This authorisation
 *   method is used throughout the system to provide authorisation management such
 *   as hiding links and redirecting to unauthorised pages. 
 *
 *   TODO: Add documentation for authorisation system
 *
 * * `beforeShow`: This function will be called before the template is bound / shown
 *    to the user. It is expected this is where most processing will occur, where
 *    data required for the view will be loaded. It is for this reason that this
 *    binding handler will wait until all AJAX requests have completed before
 *    continuining execution. This automatic listening of all AJAX requests relies on the
 *    `hx.ajax.listen` functionality, which means only AJAX requests executed through
 *    the `hx.ajax` methods will be listened to.
 *
 * * `show`: Once the `beforeShow` function has continued execution the template
 *    will be rendered, with the `view model` set as the data context. Once the
 *    template has been rendered by `knockout` the `show` function of the `view model`
 *    will be called.
 *
 * * `hide`: If a component is replaced with another (e.g. in the context of a `region`)
 *    then the previous components `hide` method will be called.
 *
 * ## Region Manager Integration
 *
 * Typically an app will use a `region manager` to manage the regions within the
 * system, to provide further semantics on top of a `component` binding handler to integrate
 * with the routing system and provide features such as checking for the dirty
 * state of regions and managing multiple regions within an application.
 *
 * The integration is managed by `region` binding handlers, a binding handler that
 * will use a region manager to determine what component to show, delegating all rendering
 * and management of individual components to this binding handler.
 */
hx.config(['$log', '$ajax', '$injector', '$authoriser', '$router'], function($log, $ajax, $injector, $authoriser, $router) {
    function getComponent(componentOrName) {
        componentOrName = ko.utils.unwrapObservable(componentOrName);

        return _.isString(componentOrName) ? $injector.get(componentOrName) : componentOrName;
    }

    function createTemplateValueAccessor(component) {
        return function() {
            return {
                data: component,
                name: component.templateName
            }
        };
    }

    koBindingHandlers.component = {
        tag: 'component->div',

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var component = getComponent(valueAccessor());

            return koBindingHandlers.template.init(element, function() { return { data: {} }; });
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var viewModelName = ko.utils.unwrapObservable(valueAccessor());
            
            ko.dependencyDetection.ignore(function() {
                var component = getComponent(viewModelName),
                    lastComponent = ko.utils.domData.get(element, '__component__currentViewModel');

                if (lastComponent && lastComponent.hide) {
                    lastComponent.hide.apply(lastComponent);
                }

                if (!component) {
                    ko.utils.emptyDomNode(element);
                    return;
                }

                $authoriser
                    .authorise(component, $router.current().parameters)
                    .done(function() {
                        ko.utils.toggleDomNodeCssClass(element, 'is-loading', true);

                        var showDeferred = new jQuery.Deferred();

                        if (component.beforeShow != null) {                
                            component.beforeShow.apply(component);
                        }

                        if (component.show != null) {
                            showDeferred = $ajax.listen(function() {
                                component.show.apply(component);
                            });
                        } else {
                            // Resolve immediately, nothing to wait for
                            showDeferred.resolve();
                        }

                        showDeferred.done(function () {
                            var templateValueAccessor = createTemplateValueAccessor(component),
                                innerBindingContext = bindingContext.extend();

                            ko.utils.toggleDomNodeCssClass(element, 'is-loading', false);

                            koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, innerBindingContext);

                            if (component.afterRender != null) {
                                component.afterRender.apply(component);
                            }

                            ko.utils.domData.set(element, '__component__currentViewModel', component);
                        });
                    })
                    .fail(function() {
                        $log.debug('Authorisation of component has failed, this component will not be rendered.');
                        ko.utils.emptyDomNode(element);                        
                    })
                
            })
        }
    };
});