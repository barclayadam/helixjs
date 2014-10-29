hx.singleton('$components', ['$injector'], function($injector) {
    function createComponent(componentName) {
        var component = $injector.get(ko.unwrap(componentName));
        component.$name = componentName

        return component;
    }

    function getComponent(componentOrName) {
        componentOrName = ko.utils.unwrapObservable(componentOrName);

        return _.isString(componentOrName) ? createComponent(componentOrName) : componentOrName;
    }

    function createTemplateValueAccessor(component, componentName, useConvention) {
        var templateName = component.templateName || (useConvention && _.isString(componentName) ? componentName : undefined);

        if (!templateName) {
            throw new Error('Cannot find a template name');
        }

        return function() {
            return {
                data: component,
                name: templateName
            }
        };
    }

    function disposeComponent(component) {
        if (component) {
            if (typeof component.hide === 'function') {
                component.hide(lastComponent);
            }

            ko.utils.objectForEach(component, disposeOne);
        }
    }

    function disposeOne(propOrValue, value) {
        var disposable = value || propOrValue;

        if (disposable && typeof disposable.dispose === "function") {
            disposable.dispose();
        }
    }

    return {
        create: getComponent,
        dispose: disposeComponent
    }
});

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
hx.bindingHandler('component', ['$log', '$ajax', '$injector', '$authoriser', '$router', '$components'], function($log, $ajax, $injector, $authoriser, $router, $components) {
    function createTemplateValueAccessor(component, componentName, useConvention) {
        var templateName = component.templateName || component.$name;

        if (!templateName) {
            throw new Error('Cannot find a template name');
        }

        return function() {
            return {
                data: component,
                name: templateName
            }
        };
    }

    return {
        tag: 'component',

        init: function (element) {
            ko.utils.domData.set(element, '__component_hasAnonymousTemplate', element.childNodes.length > 0);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                lastComponent = ko.utils.domData.get(element, '__component__currentViewModel');

                $components.dispose(lastComponent);
                lastComponent = null;
            });

            return koBindingHandlers.template.init(element, function() { return { data: {} }; });
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var componentName = ko.utils.unwrapObservable(valueAccessor());
            
            ko.dependencyDetection.ignore(function() {
                var component = $components.create(componentName),
                    lastComponent = ko.utils.domData.get(element, '__component__currentViewModel'),
                    parameters = _.extend({}, $router.current().parameters, allBindingsAccessor.get('parameters'));
                
                $components.dispose(lastComponent);
                lastComponent = null;

                if (!component) {
                    ko.utils.emptyDomNode(element);
                    return;
                }

                if (allBindingsAccessor.get('onComponentCreated') && _.isFunction(allBindingsAccessor.get('onComponentCreated'))) {
                    allBindingsAccessor.get('onComponentCreated')(component);
                }
                
                ko.utils.toggleDomNodeCssClass(element, 'is-loading', true);

                $authoriser
                    .authorise(component, parameters)
                    .then(function(isAuthorised) {
                        if (!isAuthorised) {
                            $log.debug('Authorisation of component has failed "' + componentName + '", this component will not be rendered.');

                            ko.utils.emptyDomNode(element);
                            ko.utils.toggleDomNodeCssClass(element, 'is-loading', false);

                            return;
                        }


                        var showPromises = [];

                        if (component.beforeShow != null) {                
                            component.beforeShow.call(component, parameters);
                        }

                        if (component.show != null) {
                            showPromises.push($ajax.listen(function() {
                                showPromises.push(component.show.call(component, parameters));
                            }));
                        }

                        return Promise.all(showPromises).then(function () {
                            var templateValueAccessor = createTemplateValueAccessor(component, componentName, ko.utils.domData.get(element, '__component_hasAnonymousTemplate') === false),
                                innerBindingContext = bindingContext.extend();

                            return $ajax.listen(function() {
                                koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, innerBindingContext);
                            }).then(function() {
                                ko.utils.toggleDomNodeCssClass(element, 'is-loading', false);

                                if (component.afterRender != null) {
                                    component.afterRender.call(component, parameters);
                                }

                                ko.utils.domData.set(element, '__component__currentViewModel', component);
                            });
                        });
                    })
                    .caught(function(err) {
                        $log.warn('An error occurred rendering component "' + componentName + '": ' + err.toString() + '\n' + err.stack);

                        ko.utils.emptyDomNode(element);
                        ko.utils.toggleDomNodeCssClass(element, 'is-loading', false);

                        throw err;                        
                    });                
            })
        }
    };
});