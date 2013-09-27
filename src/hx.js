(function(window, document) {
    (function(factory) {
        if (typeof define === "function" && define["amd"]) {
            // [2] AMD anonymous module
            define(["jquery", "underscore", "knockout", "exports"], factory);
        } else {
            // [3] No module loader (plain <script> tag) - put directly in global namespace
            factory(window.jQuery, window._, window.ko, window.hx = {});
        }
    })(function(jQuery, _, ko, hxExports) {
        if (jQuery === void 0) { throw new Error('jquery must be included before HelixJS.'); }
        if (_ === void 0) { throw new Error('underscore must be included before HelixJS.'); }
        if (ko === void 0) { throw new Error('knockout must be included before HelixJS.'); }

        // Declare some common variables used throughout the library
        // to help reduce minified size.
        var koBindingHandlers = ko.bindingHandlers;

        // Root namespace into which the public API will be exported.
        var hx = hxExports != null ? hxExports : {};

        //= core/utils.js
        //= core/observableReadEvent.js

        //= core/injector.js
        //= core/bootstrap.js

        //= core/log.js

        //= core/eventEmitter.js
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
        //= core/authoriser.js

        //= data/dataView.js
        //= data/provider.memory.js
        //= data/provider.odata.js
                        
        //= messaging/messaging.query.js
        //= messaging/messaging.command.js

        //= ui/ui.part.js
        //= ui/ui.uiaction.js
        //= ui/ui.regions.js
        //= ui/ui.components.js

        //= ui/ui.validation.js

        //= ui/ui.navigate.js
        //= ui/ui.pager.js
        //= ui/ui.dialog.js
        //= ui/ui.hasContentBindingHandler.js
    });
})(window, document);