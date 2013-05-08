/** @namespace $log */
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

    /**
     * @name debug
     * @memberOf $log#
     * @function
     *
     * @description
     * Logs a debug-level message to the log
     *
     * @param {string[]} args The values to log
     */

    /**
     * @name info
     * @memberOf $log#
     * @function
     *
     * @description
     * Logs an info-level message to the log
     *
     * @param {string[]} args The values to log
     */

    /**
     * @name warn
     * @memberOf $log#
     * @function
     *
     * @description
     * Logs a warn-level message to the log
     *
     * @param {string[]} args The values to log
     */

    /**
     * @name error
     * @memberOf $log#
     * @function
     *
     * @description
     * Logs an error-level message to the log
     *
     * @param {string[]} args The values to log
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