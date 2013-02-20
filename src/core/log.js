hx.singleton('$log', function() {
    var console = window.console || {},
        logger = {
            enabled: false
        };

    // We attempt to use console.log to determine availability
    // and safety of use, setting `console` to an empty object
    // in the instance of failure.
    try {
        console.log();
    } catch (e) {
        console = {};
    }

    // For the given `levels` will create a logging method
    // on the `hx.log` object to be used to log:
    //
    // * debug
    // * info
    // * warn
    // * error
    'debug info warn error'.replace(/\w+/g, function (n) {        
        logger[n] = function (arg1, arg2, arg3) {
            if (logger.enabled) {                
                // The method used to alias through to the `console.log`
                // method if available, or to fail silently if no logging
                // mechanism is built-in to the browser.
                var fn = (console[n] || console.log || hx.noop);

                // IE 8 / 9 do not have an apply function, so we will just log
                // the first 3 arguments.
                if(fn.apply) {                    
                    fn.apply(console, arguments);
                } else {
                    fn(arg1, arg2, arg3);
                }
            }
        };
    });

    return logger;
});