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
        this.$defaultValues = defaultValues;
        this.$name = name;
        this.$url = Command.urlTemplate.replace("{name}", this.$name);
        this.$valueKeys = [];

        for (var key in defaultValues) {
            this[key] = hx.utils.asObservable(defaultValues[key]);
            this.$valueKeys.push(key);
        }

        hx.validation.mixin(this, this.$valueKeys);
        $EventEmitterFactory.mixin(this);

        this.execute = this.execute.bind(this);
        this.toJSON = this.toJSON.bind(this);
    }

    Command.prototype.setUrl = function(url) {
        this.$url = url;
    }

    Command.prototype.execute = function () {
        var self = this,
            result = jQuery.Deferred();

        this.validate().done(function() {
            if (self.isValid()) {
                self.$publish('submitting', { command: self });

                execute(self.$name, self.$url, _.pick(self, self.$valueKeys))
                    .done(function(data) {
                            self.$publish('succeeded', { command: self, data: data });
                            result.resolve(data);
                        })
                    .fail(function(data) {
                            self.$publish('failed', { command: self, data: data });
                            result.reject(data);
                        });
            } else {
                self.$publish('validationFailed', { command: self });
            }
        });

        return result;
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