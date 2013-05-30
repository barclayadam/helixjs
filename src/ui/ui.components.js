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
hx.config(['$log', '$ajax', '$injector'], function($log, $ajax, $injector) {
    function getViewModel(viewModelOrName) {
        viewModelOrName = ko.utils.unwrapObservable(viewModelOrName);

        return _.isString(viewModelOrName) ? $injector.get(viewModelOrName) : viewModelOrName;
    }

    function createTemplateValueAccessor(viewModel) {
        return function() {
            return {
                data: viewModel,
                name: viewModel.templateName
            }
        };
    }

    koBindingHandlers.component = {
        tag: 'component->div',

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var viewModel = getViewModel(valueAccessor()),
                templateValueAccessor = createTemplateValueAccessor(viewModel || {});

            return koBindingHandlers.template.init(element, templateValueAccessor);
        },

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var viewModelName = valueAccessor();
            
            ko.dependencyDetection.ignore(function() {
                var regionViewModel = getViewModel(viewModelName),
                    lastViewModel = ko.utils.domData.get(element, '__region__currentViewModel'),
                    deferred = new $.Deferred();

                if (lastViewModel && lastViewModel.hide) {
                    lastViewModel.hide.apply(lastViewModel);
                }

                if (!regionViewModel) {
                    ko.utils.emptyDomNode(element);
                } else {
                    if (regionViewModel.beforeShow != null) {                
                        regionViewModel.beforeShow.apply(regionViewModel);
                    }

                    if (regionViewModel.show != null) {
                        deferred = $ajax.listen(function() {
                            regionViewModel.show.apply(regionViewModel);
                        });
                    } else {
                        // Resolve immediately, nothing to wait for
                        deferred.resolve();
                    }

                    deferred.done(function () {
                        var templateValueAccessor = createTemplateValueAccessor(regionViewModel),
                            innerBindingContext = bindingContext.extend();

                        koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, innerBindingContext);

                        if (regionViewModel.afterShow != null) {
                            regionViewModel.afterShow.apply(regionViewModel);
                        }

                        ko.utils.domData.set(element, '__region__currentViewModel', regionViewModel);
                    });
                }
            })
        }
    };
});