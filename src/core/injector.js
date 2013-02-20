/**
 * An injector provides very simply IoC semantics that allow for the registering of
 * 'modules', such that these moduels can be dependended on my other modules and they
 * will be injected as dependencies when that module is created.
 *
 * @constructor
 */
hx.Injector = function() {
    this.modules = {};

    this.provide('$injector', this);
}

hx.Injector.prototype.find = function(name) {
    name = ko.utils.stringTrim(name);

    for (var moduleName in this.modules) {
        if (moduleName.toUpperCase() == name.toUpperCase()) {
            return this.modules[moduleName];
        }
    }

    throw new Error("Cannot find module with the name '" + name + "'.");
};

hx.Injector.prototype.annotate = function(funcOrDependencies, func) {
    var injector = this;

    if(func != undefined) {
        return function() {
            return injector.instantiate(funcOrDependencies, func);
        }

    } else {
        return funcOrDependencies;
    }
};

/**
 * Registers ('provides') a new module, which is defined by a name (which must be unique), 
 * a 'creator' and some optional dependencies.
 *
 * A module can be defined either as a function that will be called every time another module
 * depends on this one to allow it to provide a value to be passed in to the dependant
 * module, or a simple object that is used to define a static value, for example the '$window'
 * module built-in that is a singleton over the built-in `window` object, or configuration
 * values.
 *
 * If a module is defined as having dependencies, by passing in an array of modules names as
 * the second parameter, then when this module is `created` those modules will be created and passed
 * to the modules `creator` function in the order of the dependencies. Note that dependencies
 * will be added to the `creator` as a property using the key `$dependencies$.
 *
 * @param {string} name - The name of the module
 * @param {array|object|function} - An array of dependencies, or the creator of this module, 
 *   either a singleton object or a function
 * @param {object|function} creator - The creator of this module, a singleton object or a function 
 *   to be called on each creation
 */
hx.Injector.prototype.provide = function(name, creatorOrDependencies, creator) {
    name = ko.utils.stringTrim(name);

    this.modules[name] = this.annotate(creatorOrDependencies, creator);
};

/**
 * Registers a 'singleton', a module that will be created once on the first creation ({@link injector.create}),
 * and then have its return value subsequently returned on all further creations.
 *
 * @param {string} name - The name of the module
 * @param {array|object|function} - An array of dependencies, or the creator of this module, 
 *   either a singleton object or a function
 * @param {function} creator - The creator of this module, that will be executed with the specified
 *  dependencies once on first creation.
 */
hx.Injector.prototype.singleton = function(name, dependencies, creator) {
    var injector = this,
        created = false,
        moduleReturn = undefined;

    this.provide(name, function() {
        if(!created) {
            moduleReturn = injector.instantiate(dependencies, creator);
            created = true;
        }

        return moduleReturn;
    })
}

/**
 * Creates a module given the specified options, which can be a string to create a named
 * and registered module, a function with optional dependencies, or a static object that
 * will be immediately returned.
 *
 * @param {string|object|function} optionsOrDependencies - A named module 
 *   to create, a static object to be immediately returned or a function with optional dependencies to execute, *or*
 *   an array of dependencies to inject
 */
hx.Injector.prototype.get = function(optionsOrDependencies) {
    if(typeof optionsOrDependencies == "function") {
        // We are providing a function, with optional dependencies attached. If the function
        // has previously been annotated (as is the case with any registered directly with this
        // injector), then it will be executed with loaded dependencies
        return optionsOrDependencies();
    } else if(typeof optionsOrDependencies == "string") {
        // We are asking for a module by name
        return this.get(this.find(optionsOrDependencies));
    } else {
        // We have an object, just return as-is
        return optionsOrDependencies;
    }
};

/**
 * Instantiates a function / module that has not been registered or annotated by passing directly
 * a list of dependencies plus the function to execute.
 *
 * @param {array<string|object|function>} dependencies - An array of dependencies
 * @param {function} func - The function to be executed with the loaded dependencies
 */
hx.Injector.prototype.instantiate = function(dependencies, func) {
    // No dependencies have been specified, just execute function.
    if(func == undefined) {
        return dependencies();
    }

    // Dependencies have been defined
    if(!_.isArray(dependencies)) {
        dependencies = [dependencies];
    }

    var injector = this,
        arguments = _.map(dependencies, function(d) {
            return injector.get(d)
        });

    return func.apply(null, arguments);
};