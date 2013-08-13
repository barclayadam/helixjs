(function() {
    hx.provide('$RegionManager', ['$injector', '$log'], function($injector, $log) {
        function getViewModel(viewModelOrName) {
            viewModelOrName = ko.utils.unwrapObservable(viewModelOrName);

            return _.isString(viewModelOrName) ? $injector.get(viewModelOrName) : viewModelOrName;
        }

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
                    return this.regions[_.keys(this.regions)[0]](getViewModel(viewModel));
                } else if (this.defaultRegion != null) {
                    return this.regions[this.defaultRegion](getViewModel(viewModel));
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
                for (var regionKey in viewModels) {
                    if (this.regions[regionKey] === void 0) {
                        $log.debug("This region manager does not have a '" + regionKey + "' region");
                    } else {
                        this.regions[regionKey](getViewModel(viewModels[regionKey]));
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
     * These regions define 'holes' in the document structure into which view `components` will
     * be rendered. A region manager and associated regions are a small management layer 
     * on top of the `component` binding handler to allow the management of complexity when
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
     * is responsible for managing a section of a page, where that section
     * will show any number of `components` through the apps lifecycle, changing
     * depending on the region manager that this binding handler belongs to.
     *
     * Typically an application will use the `app` binding handler, which itself
     * registers a region manager to which a region can be attached. This app-level
     * region manager handles routing, to allow routes to specify what components to
     * load into regions:
     *
     *     $router.route('manage/projects', '/manage/projects/', { 'main': 'manage/projects' });
     *
     *
     * The above example will register a route (at URL `/manage/projects`) that will load
     * the component `manage/projects` into the `main` region.
     */
    hx.config(function() {
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
                    regionId = element.id || 'main';

                if(!regionManager) {
                    throw new Error('A region binding handler must be a child of a regionManager or app binding handler')
                }

                regionManager
                    .register(regionId, (element.getAttribute('data-default')) === 'true')
                    .subscribe(function(region) {                    
                        koBindingHandlers.component.update(element, function() { return region }, allBindingsAccessor, viewModel, bindingContext);
                    });

                return koBindingHandlers.component.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
            }
        };
    });
}())