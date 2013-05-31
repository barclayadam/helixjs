hx.singleton('$Command', ['$log', '$ajax', '$EventEmitterFactory'], function($log, $ajax, $EventEmitterFactory) {
    
    function execute(name, url, values) {
        $log.info("Executing command '" + name + "'.");

        return $ajax
                .url(url)
                .data(values || {})
                .post();
    }

    /**
     Initialises a new instance of the `hx.messaging.Command` class with the
     specified name and default values. 
    
     The `defaultValues` object defines all properties of a command, no properties 
     defined on a command that are not included in this object will be serialised 
     when the command is executed.
    */
    function Command(name, defaultValues) {
        var key, value;

        this.$defaultValues = defaultValues;
        this.$name = name;
        this.$url = Command.urlTemplate.replace("{name}", this.$name);

        for (key in defaultValues) {
            value = defaultValues[key];
            this[key] = hx.utils.asObservable(value);
        }

        hx.validation.mixin(this);
        $EventEmitterFactory.mixin(this);

        this.execute = this.execute.bind(this);
        this.toJSON = this.toJSON.bind(this);
    }

    Command.prototype.setUrl = function(url) {
        this.$url = url;
    }

    Command.prototype.execute = function () {
        this.validate();

        if (this.isValid()) {
            this.$publish('submitting', { command: this });

            var executionPromise = execute(this.$name, this.$url, this);

            executionPromise.then(function(data) {
                this.$publish('succeeded', { command: this, data: data });
            }.bind(this));

            executionPromise.fail(function(data) {
                this.$publish('failed', { command: this, data: data });
            }.bind(this));

            return executionPromise;
        } else {
            this.$publish('validationFailed', { command: this });
            
            // If not valid then a promise that never resolves is returned.
            // TODO: Is this the correct thing to do?
            return jQuery.Deferred();
        }
    };

    Command.prototype.toJSON = function () {
        var definedValues = {};

        for (var key in this.$defaultValues) {
            definedValues[key] = ko.utils.unwrapObservable(this[key]);
        }

        return definedValues;
    };

    Command.urlTemplate = '/api/{name}'; 

    return Command;
});