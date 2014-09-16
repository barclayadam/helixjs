define(["require", "exports"], function(require, exports) {
    

    var App = (function () {
        function App(name) {
            this.name = name;
        }
        App.prototype.greeting = function () {
            return "Hello " + this.name;
        };
        return App;
    })();
    return App;
});
//# sourceMappingURL=logger.js.map
