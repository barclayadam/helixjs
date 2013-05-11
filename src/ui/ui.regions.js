(function() {
    hx.provide('$RegionManager', ['$injector', '$log'], function($injector, $log) {
        return (function () {
 
            /**
             * A `RegionManager` provides the management of a number of regions within a
             * section of an application, typically with one per application using the
             * implicit region manager provided by the `app` binding handler.
             *
             * A region manager maintains a key <-> view model mapping, with regions
             * being updated either individually or all at once, typically with a
             * route navigation event.
             *
             * @class RegionManager
             */
            function RegionManager() {
                this.defaultRegion = void 0;
                this.regions = {};
            }

            /**
             * Shows a single view model, by either placing it in the single region that
             * has been registered with this region manager, or putting it in the
             * default region.
             *
             * If there are more than 1 regions registered, and no default has been specified
             * then an error will be thrown.
             *
             * @param {object} viewModel The view model to be shown
             */
            RegionManager.prototype.showSingle = function (viewModel) {
                // If a single region has been set use whatever name was given.
                if (_.keys(this.regions).length === 1) {
                    return this.regions[_.keys(this.regions)[0]](viewModel);
                } else if (this.defaultRegion != null) {
                    return this.regions[this.defaultRegion](viewModel);
                } else {
                    throw new Error('Cannot use the showSingle method when multiple regions exist');
                }
            };

            /*
             * Shows a number of view models, with the object being a mapping of region names
             * to view models to be shown.
             *
             * Any regions that are not specified as changing in the specified view models
             * parameter will *not* be changed.
             *
             * If a key exists in the object that is passed but no registered region has that
             * name a `debug` level log message will be output to indiciate a potential problem.
             *
             * @example
             *
             * regionManager.show({
             *      'navigation': new NavigationViewModel(), 
             *      'main': new DashboardViewModel()
             * });
             *
             * @param {object} viewModels The view models that will be shown
             */
            RegionManager.prototype.show = function (viewModels) {
                var regionKey, vm;

                for (regionKey in viewModels) {
                    vm = $injector.get(viewModels[regionKey]);

                    if (this.regions[regionKey] === void 0) {
                        $log.debug("This region manager does not have a '" + regionKey + "' region");
                    } else {
                        this.regions[regionKey](vm);
                    }
                }
            };

            RegionManager.prototype.register = function (name, isDefault) {
                if (isDefault) {
                    this.defaultRegion = name;
                }

                return this.regions[name] = ko.observable();
            };

            RegionManager.prototype.get = function (name) {
                return this.regions[name]();
            };

            return RegionManager;

        })();
    });

    var regionManagerContextKey = '$regionManager';

    /**
     * @bindingHandler regionManager
     *
     * A `regionManager` is a binding handler that is typically applied at the root
     * of a document structure to provide the necessary management of `regions` (of which
     * there may only be one, in many applications) within a `HelixJS` application.
     * 
     * Once a `regionManager` has been bound there may be any number of `region` elements
     * as children (they do not have to be direct descendants) that are managed by
     * the region manager.
     * 
     * These regions define 'holes' in the document structure into which view `parts` will
     * be rendered. A region manager and associated regions are a small management layer 
     * on top of the `part` binding handler to allow the management of complexity when
     * it comes to multiple regions within a single application, to avoid individual modules
     * and parts of the system knowing too much about these regions.
     */
    koBindingHandlers.regionManager = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var regionManager = ko.utils.unwrapObservable(valueAccessor()),
                regionManagerProperties = {},
                innerBindingContext;

            regionManagerProperties[regionManagerContextKey] = regionManager;
            innerBindingContext = bindingContext.extend(regionManagerProperties);

            ko.applyBindingsToDescendants(innerBindingContext, element);

            return { controlsDescendantBindings: true };
        }
    };

    /**
     * @bindingHandler region
     * @tagReplacement div
     *
     * # Overview
     *
     * A key component of any `HelixJS` application, the `region` binding handler
     * is responsible for managing a section of a page, to provide simple
     * lifecycle management for showing `regions`.
     *
     * A region is the lowest level of abstraction for view model and view rendering,
     * providing only a small amount of functionality on the top of the `template`
     * binding handler in `knockout`, as described in details below.
     *
     * A region is defined by a template (either named or anonymous) and a
     * `view model`, a view model being defined as nothing more than a 
     * simple object with optional methods and properties that can affect
     * the rendering and hook in to lifecycle management events.
     *
     * A region takes a single parameter, which is the `view model` that is to
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
     * system, to provide further semantics on top of a `region` binding handler to integrate
     * with the routing system and provide features such as checking for the dirty
     * state of regions and managing multiple regions within an application.
     *
     * When integrating with a region manager the region binding handler should not directly
     * be given a view model, but instead the parameter will be the name of the region that
     * will be registered with the parent view model to be bound later for display.
     *
     * If more than one region is bound a default can be selected that will be used when
     * a single view model is shown without specifying the name. This is achieved by
     * adding a data-default="true" attribute on the region.
     */
    hx.instantiate(['$log', '$ajax', '$injector'], function($log, $ajax, $injector) {
        function getViewModel(valueAccessor) {
            return $injector.get(ko.utils.unwrapObservable(valueAccessor()))
        }

        function createTemplateValueAccessor(viewModel) {
            return function() {
                return {
                    data: viewModel,
                    name: viewModel.templateName
                }
            };
        }

        koBindingHandlers.region = {
            tag: 'region->div',

            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var regionManager = bindingContext[regionManagerContextKey],
                    viewModel = getViewModel(valueAccessor),
                    templateValueAccessor = createTemplateValueAccessor(viewModel),
                    regionId = element.id || 'main';

                if (regionManager) {
                    $log.debug('Registering region "' + regionId + '" with parent region manager.');
                    regionManager.register(regionId, (element.getAttribute('data-default')) === 'true');
                } else if(!viewModel) {
                    throw new Error('A null or undefined view model cannot be passed to a region binding handler without a parent region manager (or app)');                    
                }

                return koBindingHandlers.template.init(element, templateValueAccessor);
            },

            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var deferred, lastViewModel, regionViewModel,
                    regionManager = bindingContext[regionManagerContextKey],
                    regionId = element.id || 'main';

                if(regionManager) {
                    $log.debug('Getting view model from the "' + regionId + '" region from parent region manager to render.');
                    regionViewModel = regionManager.get(element.id || 'main');
                } else {
                    $log.debug('Getting view model with module name "' + valueAccessor() + '"');
                    regionViewModel = getViewModel(valueAccessor);
                }

                if (!regionViewModel) {
                    $log.info('Cannot find region view model.')
                    return;
                }

                lastViewModel = ko.utils.domData.get(element, '__region__currentViewModel');

                if (lastViewModel && lastViewModel.hide) {
                    lastViewModel.hide.apply(lastViewModel);
                }

                deferred = new $.Deferred();

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

                    // Children should not inherit the region manager - else any child regions will attempt to register
                    // with it.
                    innerBindingContext[regionManagerContextKey] = null;

                    koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, innerBindingContext);

                    if (regionViewModel.afterShow != null) {
                        regionViewModel.afterShow.apply(regionViewModel);
                    }

                    ko.utils.domData.set(element, '__region__currentViewModel', regionViewModel);
                });
            }
        };
    });
}())