var regionManagerContextKey = '$regionManager';

hx.RegionManager = (function () {

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
            vm = viewModels[regionKey];

            if (this.regions[regionKey] === void 0) {
                hx.log.debug("This region manager does not have a '" + regionKey + "' region");
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

/**
 A `regionManager` is a binding handler that is typically applied at the root
 of a document structure to provide the necessary management of `regions` (of which
 there may only be one in many applications) within a `HelixJS` application.

 Once a `regionManager` has been bound there may be any number of `region` elements
 as children (they do not have to be direct descendants) that are managed by
 the region manager.

 These regions define 'holes' in the document structure into which view `parts` will
 be rendered. A region manager and associated regions are a small management layer 
 on top of the `part` binding handler to allow the management of complexity when
 it comes to multiple regions within a single application, to avoid individual modules
 and parts of the system knowing too much about these regions.
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

koBindingHandlers.region = {
    tag: 'region->div',

    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var isDefault = (element.getAttribute('data-default')) === 'true',
            regionId = element.id || 'main', 
            regionManager = bindingContext[regionManagerContextKey];

        if (regionManager === void 0) {
            throw new Error('A region binding handler / tag must be a child of a regionManager');
        }

        regionManager.register(regionId, isDefault);

        return koBindingHandlers.part.init(element, (function () {
            return {};
        }), allBindingsAccessor, viewModel, bindingContext);
    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var regionId = element.id || 'main',
            regionManager = bindingContext[regionManagerContextKey];

        return koBindingHandlers.part.update(element, (function () {
            return regionManager.get(regionId);
        }), allBindingsAccessor, viewModel, bindingContext);
    }
};