hx.singleton('$Command', ['$log', '$ajax', '$EventEmitter'], function($log, $ajax, $EventEmitter) {
    
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
        $EventEmitter.mixin(this);

        this.execute = this.execute.bind(this);
        this.toJSON = this.toJSON.bind(this);
    }

    Command.prototype.execute = function () {
        this.validate();

        if (this.isValid()) {
            $EventEmitter.publish('submitting');

            var executionPromise = Command.execute(this.__name, this);

            executionPromise.then(function() {
                $EventEmitter.publish('succeeded');
            });

            executionPromise.fail(function() {
                $EventEmitter.publish('failed');
            });

            return executionPromise;
        } else {
            // If not valid then a promise that never resolves is returned.
            // TODO: Is this the correct thing to do?
            return jQuery.Deferred();
        }
    };

    Command.prototype.toJSON = function () {
        var definedValues = {};

        for (var key in this.defaultValues) {
            definedValues[key] = ko.utils.unwrapObservable(this[key]);
        }

        return definedValues;
    };

    Command.urlTemplate = '/api/{name}';  

    /**
     Executes a 'command', something that is simply defined as an AJAX call to a predefined
     URL that has the name injected and JSON values POSTed.

     The URL template that is used is defined by `$command.urlTemplate`, with a single
     placeholder that will be replaced:

     * `{name}`: Replaced by the value of `commandName` passed to this method

     This method returns a promise that will resolve with the value of the AJAX call.
    */
    Command.execute = function (commandName, values) {
        if (values == null) { values = {}; }

        $log.info("Executing command '" + commandName + "'.");

        return $ajax
                .url(Command.urlTemplate.replace("{name}", commandName))
                .data(values)
                .post();
    };

    return Command;
});