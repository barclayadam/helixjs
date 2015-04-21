/** 
 * @class $Log 
 * @static
 */
hx.singleton('$Log', function() {
    var console = window.console || {},
        canApply = true,
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

    try {
        canApply = console.log && console.log.apply;
    } catch (e) {
        canApply = false
    }

    /**
     * Logs a debug-level message to the log.
     *
     * @method debug
     * @param {object} args* The values to log
     */

    /**
     * Logs a info-level message to the log.
     *
     * @method info
     * @param {object} args* The values to log
     */

    /**
     * Logs a warn-level message to the log.
     *
     * @method warn
     * @param {object} args* The values to log
     */

    /**
     * Logs a error-level message to the log.
     *
     * @method error
     * @param {object} args* The values to log
     */

    'debug info warn error'.replace(/\w+/g, function (n) {        
        logger[n] = function (arg1, arg2, arg3) {
            if (logger.enabled) {                
                // The method used to alias through to the `console.log`
                // method if available, or to fail silently if no logging
                // mechanism is built-in to the browser.
                var fn = (console[n] || console.log || hx.noop);

                // IE 8 / 9 do not have an apply function, so we will just log
                // the first 3 arguments.
                if (canApply && fn.apply) {                    
                    fn.apply(console, arguments);
                } else {
                    fn(arg1, arg2, arg3);
                }
            }
        };
    });

    return logger;
});