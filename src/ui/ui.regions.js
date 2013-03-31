(function() {
    hx.provide('$RegionManager', ['$injector', '$log'], function($injector, $log) {
        return (function () {

            function RegionManager() {
                this.defaultRegion = void 0;
                this.regions = {};
            }

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
     * the rendering and hook in to simple lifecycle management.
     *
     * A region takes a single parameter, which is the `view model` that is to
     * be shown. If this property is an observable that if that observable is
     * updated the binding handler will `hide` the currently bound view model
     * and bind the new one and (optionally) switch out the template.
     *
     * ## Region Manager Integration
     *
     * Typically an app will use a `region manager` to manage the regions within the
     * system, to provide further semantics on top of a `region` binding handler to integrate
     * with the routing system and provide features such as checking for the dirty
     * state of regions and managing multiple regions within an application.
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
     */
    hx.instantiate(['$ajax', '$injector'], function($ajax, $injector) {
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
                    templateValueAccessor = createTemplateValueAccessor(viewModel);

                if (regionManager) {
                    regionManager.register(element.id || 'main', (element.getAttribute('data-default')) === 'true');
                } else if(!viewModel) {
                    throw new Error('A null or undefined view model cannot be passed to a region binding handler');                    
                }

                return koBindingHandlers.template.init(element, templateValueAccessor);
            },

            update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                var deferred, lastViewModel, regionViewModel,
                    regionManager = bindingContext[regionManagerContextKey];

                if(regionManager) {
                    regionViewModel = regionManager.get(element.id || 'main');
                } else {
                    regionViewModel = getViewModel(valueAccessor);
                }

                if (!regionViewModel) {
                    return;
                }

                lastViewModel = ko.utils.domData.get(element, '__region__currentViewModel');

                if (lastViewModel && lastViewModel.hide) {
                    lastViewModel.hide();
                }

                deferred = new $.Deferred();

                if (regionViewModel.show != null) {
                    deferred = $ajax.listen(regionViewModel.show);
                } else {
                    // Resolve immediately, nothing to wait for
                    deferred.resolve();
                }

                deferred.done(function () {
                    var templateValueAccessor = createTemplateValueAccessor(regionViewModel);

                    koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, bindingContext);

                    if (regionViewModel.afterShow != null) {
                        regionViewModel.afterShow();
                    }

                    ko.utils.domData.set(element, '__region__currentViewModel', regionViewModel);
                });
            }
        };
    });

}())