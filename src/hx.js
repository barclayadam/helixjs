(function(window, document, $, ko) {
    (function(factory) {
        // Support three module loading scenarios
        if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
            // [1] CommonJS/Node.js
            factory(module["exports"] || exports);
        } else if (typeof define === "function" && define["amd"]) {
            // [2] AMD anonymous module
            define(["exports"], factory);
        } else {
            // [3] No module loader (plain <script> tag) - put directly in global namespace
            factory(window["hx"] = {});
        }
    })(function(hxExports) {
        if (ko === void 0) {
            throw new Error('knockout must be included before HelixJS.');
        }

        // Declare some common variables used throughout the library
        // to help reduce minified size.
        var koBindingHandlers = ko.bindingHandlers;

        // Root namespace into which the public API will be exported.
        var hx = hxExports != null ? hxExports : {};

        //= core/utils.js

        //= core/injector.js
        //= core/bootstrap.js

        //= core/log.js

        //= core/bus.js
        //= core/uri.js
        //= core/ajax.js
        //= core/sorting.js
        //= core/storage.js
        //= core/notifications.js
        //= core/templating.js
        //= core/validation.js
        //= core/validation.rules.js
        //= core/location.js
        //= core/routing.js
                
        //= core/tagBindingsProvider.js
        //= core/viewModel.js

        //= data/dataSource.js
        
        //= messaging/messaging.query.js
        //= messaging/messaging.command.js

        //= ui/ui.uiaction.js
        //= ui/ui.partBindingHandler.js
        //= ui/ui.regionManager.js

        //= ui/ui.validation.js

        //= ui/ui.navigate.js
    });
})(window, document, window["jQuery"], window["ko"]);