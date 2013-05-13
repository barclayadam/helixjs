hx.singleton('$command', ['$log', '$ajax'], function($log, $ajax) {
    var ret = {};
    
    ret.commandUrlTemplate = 'Command/{name}';

    /**
     Executes a 'command', something that is simply defined as an AJAX call to a predefined
     URL that has the name injected and JSON values POSTed.

     The URL template that is used is defined by `hx.messaging.commandUrlTemplate`, with two
     placeholders that will be replaced:

     * `{name}`: Replaced by the value of `queryName` passed to this method

     This method returns a promise that will resolve with the value of the AJAX call.
    */
    ret.execute = function (commandName, values) {
        if (values == null) {
            values = {};
        }

        $log.info("Executing command '" + commandName + "'.");

        return $ajax
                .url(ret.commandUrlTemplate.replace("{name}", commandName))
                .data(values)
                .post();
    };

    // TODO: This should not differ just on capitalisation of the C!

    ret.Command = (function () {

        /**
         Initialises a new instance of the `hx.messaging.Command` class with the
         specified name and default values. 
        
         The `defaultValues` object defines all properties of a command, no properties 
         defined on a command that are not included in this object will be serialised 
         when the command is executed.
        */
        function Command(name, defaultValues) {
            var key, value;

            this.defaultValues = defaultValues;
            this.__name = name;

            for (key in defaultValues) {
                value = defaultValues[key];
                this[key] = hx.utils.asObservable(value);
            }

            hx.validation.mixin(this);
        }

        Command.prototype.execute = function () {
            this.validate();

            if (this.isValid()) {
                return ret.execute(this.__name, this);
            } else {
                // If not valid then a promise that never resolves is returned.
                // TODO: Is this the correct thing to do?
                return jQuery.Deferred();
            }
        };

        Command.prototype.toJSON = function () {
            var definedValues, key, value, _ref1;
            definedValues = {};
            _ref1 = this.defaultValues;

            for (key in _ref1) {
                value = _ref1[key];
                definedValues[key] = ko.utils.unwrapObservable(this[key]);
            }

            return definedValues;
        };

        return Command;
    })();

    return ret;
});