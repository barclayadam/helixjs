(function() {
    // The main injector into which all modules will be loaded via calls to hx.provide
    var injector = new hx.Injector(),
        configBlocks = [],
        configBlocksRun = false;

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
     * services have been registered ({@link hx.provide}).
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
        if(configBlocksRun) {
            injector.instantiate(blockOrDependencies, block);
        } else {
            configBlocks.push([blockOrDependencies, block]);
        }
    };
 

    /**
     * Runs all registered config blocks (see hx.config).
     *
     * @method runConfigBlocks
     * @static
     * @for hx 
     */
    hx.runConfigBlocks = function() {
        for (var i in configBlocks) {
            injector.instantiate(configBlocks[i][0], configBlocks[i][1]);
        }

        configBlocks = [];
        configBlocksRun = true;
    }

    hx.start = function() {
        ko.utils.toggleDomNodeCssClass(document.body, 'app-loading', true);

        hx.runConfigBlocks();
        ko.applyBindings({});

        hx.get('$location').initialise();

        ko.utils.toggleDomNodeCssClass(document.body, 'app-loading', false);

        hx.get('$bus').publish('app:started');
    };
})();