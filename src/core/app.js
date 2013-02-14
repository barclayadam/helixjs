hx.App = (function() {
    function App() {
        this.regionManager = new hx.RegionManager();
        this.router = new hx.routing.Router();
    }

    App.prototype.start = function() {
        var _this = this;
        
        hx.log.info("Starting application");
        hx.location.initialise();

        hx.bus.subscribe('routeNavigated', function(msg) {
          if (msg.options != null) {
            _this.regionManager.show(msg.options);
          }
        });
    };

    return App;

})();

koBindingHandlers.app = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var app = valueAccessor();
        
        koBindingHandlers.regionManager.init(element, (function() {
            return app.regionManager;
        }), allBindingsAccessor, viewModel, bindingContext);
        
        app.start();

        return { controlsDescendantBindings: true };
    }
};
