var dependenciesKey = '$dependencies';

/**
  An injector provides very simply IoC semantics that allow for the registering of
  'modules', such that these moduels can be dependended on my other modules and they
  will be injected as dependencies when that module is created.

  @constructor
*/
hx.Injector = function() {
    this.modules = {};
}

hx.Injector.prototype.find = function(name) {
    name = ko.utils.stringTrim(name);

    for (var moduleName in this.modules) {
        if (moduleName.toUpperCase() == name.toUpperCase()) {
            return this.modules[moduleName];
        }
    }
}

/**
  Registers ('provides') a new module, which is defined by a name (which must be unique), 
  a 'creator' and some optional dependencies.

  A module can be defined either as a function that will be called every time another module
  depends on this one to allow it to provide a value to be passed in to the dependant
  module, or a simple object that is used to define a static value, for example the '$window'
  module built-in that is a singleton over the built-in `window` object, or configuration
  values.

  If a module is defined as having dependencies, by passing in an array of modules names as
  the second parameter, then when this module is `created` those modules will be created and passed
  to the modules `creator` function in the order of the dependencies. Note that dependencies
  will be added to the `creator` as a property using the key `$dependencies$.

  @param {string} name - The name of the module
  @param {array|object|function} - An array of dependencies, or the creator of this module, 
    either a singleton object or a function
  @param {object|function} creator - The creator of this module, a singleton object or a function 
    to be called on each creation
*/
hx.Injector.prototype.provide = function(name, creatorOrDependencies, creator) {
    name = ko.utils.stringTrim(name);

    if(creator != undefined) {
        if(_.isArray(creatorOrDependencies)) {
            creator[dependenciesKey] = creatorOrDependencies;
        } else {
            creator[dependenciesKey] = [creatorOrDependencies];
        }
    } else {
        creator = creatorOrDependencies;
    }

    this.modules[name] = creator;
}

/**
  Creates a module given the specified options, which can be a string to create a named
  and registered module, a function with optional dependencies, or a static object that
  will be immediately returned.

  If a function is given it can have dependencies registered as an array of named modules
  by adding a property named `$dependencies` to the function.

  @param {string|object|function} options - A named module to create, a static objetc to be immediately
    returned or a function with optional dependencies to execute
*/
hx.Injector.prototype.create = function(options) {
    var injector = this;

    if(typeof options == "function") {
        // We are providing a function, with optional dependencies attached
        if(options[dependenciesKey]) {
            var arguments = _.map(options[dependenciesKey], function(d) {
                return injector.create(d)
            })

            return options.apply(null, arguments);
        } else {
            return options();
        }
    } else if(typeof options == "string") {
        // We are asking for a module by name
        return this.create(this.find(options));
    } else {
        // We have an object, just return as-is
        return options;
    }
}