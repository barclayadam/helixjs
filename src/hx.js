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

        //= core/log.js
        //= core/injector.js

        //= core/bus.js
        //= core/uri.js
        //= core/ajax.js
        //= core/sorting.js
        //= core/storage.js
        //= core/notifications.js
        //= core/templating.js
        //= core/validation.js
        //= core/validation.rules.js
        //= core/dataSource.js
        //= core/location.js
        //= core/routing.js
                
        //= core/tagBindingsProvider.js
        //= core/viewModel.js

        //= core/app.js

        //= messaging/messaging.query.js
        //= messaging/messaging.command.js

        //= ui/ui.uiaction.js
        //= ui/ui.partBindingHandler.js
        //= ui/ui.regionManager.js

        // Once everything has been loaded we bootstrap, which simply involvs attempting
        // to bind the current document, which will find any app binding handler definitions
        // which kicks off the 'app' semantics of a HelixJS application.

        // TODO: Remove jQuery dependency
        $(document).ready(function() {
            ko.applyBindings({});
        });
    });
})(window, document, window["jQuery"], window["ko"]);