(function() {
    /**
     * Instantiates a function / module that has not been registered or annotated by passing directly
     * a list of dependencies plus the function to execute.
     *
     * @param {array<string|object|function>} dependencies - An array of dependencies
     * @param {function} func - The function to be executed with the loaded dependencies
     */
    function instantiate(injector, dependencies, func) {
        // No dependencies have been specified, just execute function.
        if(dependencies == undefined) {
            if(typeof func == "function") {
                return func();
            } else {
                return func;
            }
        }

        // Dependencies have been defined
        if(!_.isArray(dependencies)) {
            dependencies = [dependencies];
        }

        var arguments = _.map(dependencies, function(d) {
                if(_.isArray(d)) {
                    var instantiatedModules = injector.get(d[0]);

                    return _.isArray(instantiatedModules) ? instantiatedModules : [instantiatedModules];
                } else {
                    return injector.get(d)
                }
            });

        return func.apply(null, arguments);
    };

    function annotate(injector, funcOrDependencies, func) {
        if(!func) {
            func = funcOrDependencies;
            funcOrDependencies = undefined;
        }

        if(_.isFunction(func)) {
            return function() {
                return instantiate(injector, funcOrDependencies, func);
            }
        } else {
            return function() {
                return func;
            }
        }
    };

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

        var annotatedCreator = annotate(this, creatorOrDependencies, creator),
            currentModule = this.modules[name];

        if(currentModule) {
            if(_.isArray(currentModule)) {
                currentModule.push(annotatedCreator)
            } else {
                this.modules[name] = [currentModule, annotatedCreator]
            }
        } else {
            this.modules[name] = annotatedCreator;
        }
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
        var created = false,
            moduleReturn = undefined,
            creator = annotate(this, dependencies, creator);

        this.provide(name, function() {
            if(!created) {
                moduleReturn = creator();
                created = true;
            }

            return moduleReturn;
        })
    }

    /**
     * Creates a module given the specified module name, throwing an error in the case that
     * no such module has been previously registered.
     *
     * @param {string} moduleName - A named module to create
     */
    hx.Injector.prototype.get = function(moduleName) {
        var module = this.find(moduleName);

        if(_.isArray(module)) {
            return _.map(module, function(m) { return m(); });
        } else {
            return module();
        }
    };
}());