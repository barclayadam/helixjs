(function() {
    // The main injector into which all modules will be loaded via calls to hx.provide
    var injector = new hx.Injector();

    // Expose methods of the single internal injector as 'globals'.
    hx.provide = injector.provide.bind(injector);
    hx.singleton = injector.singleton.bind(injector); 
    hx.get = injector.get.bind(injector);

    /**
     * A simple no-op function that can be used in places where a function is expected
     * but no functionality is available (e.g. due to browser environment).
     *
     * @method noop
     * @static
     * @for hx 
     */
    hx.noop = function() {};   

    /**
     * Registers a `config` block that will be executed (with the (optionally) specified
     * dependencies injected) on app start, used to configure existing services, once all
     * services have been registered ({@link hx.provide).
     *
     * @method config
     * @static
     * @for hx 
     *
     * @param {function|array} blockOrDependencies The function to run, or an array of
     * dependencies with the function passed in as the second parameter
     * @param {function} block The function to execute, if the first parameter was
     * a list of dependencies
     */
    hx.config = function(blockOrDependencies, block) {
        injector.provide('$configBlocks', blockOrDependencies, block);
    };
 

    /**
     * Runs all registered config blocks (see hx.config).
     *
     * @method runConfigBlocks
     * @static
     * @for hx 
     */
    hx.runConfigBlocks = function() {
        // By getting the config blocks they will be executed, with dependencies
        // injected, therefore no further work is required here
        injector.get('$configBlocks');
    }

    function startApp() {
        var $location = hx.get('$location'),
            $bus = hx.get('$bus'),
            $RegionManager = hx.get('$RegionManager');

        var appRegionManager = new $RegionManager();
        hx.provide('$appRegionManager', appRegionManager);

        hx.runConfigBlocks();

        // Tie together routing with the application's main region manager
        $bus.subscribe('routeNavigated', function(msg) {
            var components = msg.route.getComponents();
            
            if (components != null) {
                appRegionManager.show(components);
            }
        })

        $location.initialise();
    }

    // Once everything has been loaded we bootstrap, which simply involves attempting
    // to bind the current document, which will find any app binding handler definitions
    // which kicks off the 'app' semantics of a HelixJS application.

    function bootstrap() {
        ko.applyBindings({});        
    }

    // TODO: Remove jQuery dependency
    $(document).ready(bootstrap);

    koBindingHandlers.app = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            // Once the app has been bootstrapped we want to set-up the region manager
            // before the app is properly 'started' (e.g. location services is initialised)
            hx.config(function() {
                koBindingHandlers.regionManager.init(element, (function() {
                    return hx.get('$appRegionManager');
                }), allBindingsAccessor, viewModel, bindingContext);
            });         

            startApp(); 
            
            return { controlsDescendantBindings: true };
        }
    };
})();