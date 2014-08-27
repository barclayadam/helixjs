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
        if(func == undefined) {
            if(typeof dependencies == "function") {
                return dependencies();
            } else {
                return dependencies;
            }
        }
        
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
                var found = injector.find(d);

                if (!found) {
                    throw new Error('Could not find dependency "' + d + '" for "' + (func.annotatedName || '[anonymous]') + '"');
                }

                return found();
            });

        return func.apply(null, arguments);
    }

    function annotate(injector, funcOrDependencies, func, name) {
        if(!func) {
            func = funcOrDependencies;
            funcOrDependencies = undefined;
        }

        var annotated;

        if(_.isFunction(func)) {
            annotated = function() {
                return instantiate(injector, funcOrDependencies, func);
            }
        } else {
            annotated = function() {
                return func;
            }
        }

        annotated.annotatedName = name;
        return annotated;
    }

    function normaliseModuleName(name) {
        return ko.utils.stringTrim(name).toLowerCase();
    }

    /**
     * An injector provides simple IoC semantics that allow for the registering of
     * 'modules', such that these moduels can be dependended on my other modules and they
     * will be injected as dependencies when that module is created.
     *
     * @class hx.Injector
     */
    hx.Injector = function() {
        this.modules = {};

        this.provide('$injector', this);
    }

    hx.Injector.prototype.instantiate = function(dependencies, func) {
        return instantiate(this, dependencies, func);
    }

    hx.Injector.prototype.find = function(name) {
        return this.modules[normaliseModuleName(name)];
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
     * to the modules `creator` function in the order of the dependencies. 
     * 
     * @method provide

     * @param {string} name - The name of the module
     * @param {array|object|function} - An array of dependencies, or the creator of this module, 
     *   either a singleton object or a function
     * @param {object|function} creator - The creator of this module, a singleton object or a function 
     *   to be called on each creation
     */
    hx.Injector.prototype.provide = function(name, creatorOrDependencies, creator) {
        name = normaliseModuleName(name);

        var annotatedCreator = annotate(this, creatorOrDependencies, creator, name),
            currentModule = this.modules[name];

        if (currentModule) {
            console.log('Overriding module ' + name);
        }

        this.modules[name] = annotatedCreator;
    };

    /**
     * Registers a 'singleton', a module that will be created once on the first creation ({@link injector.create}),
     * and then have its return value subsequently returned on all further creations.
     *
     * @method singleton
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
     * @method get
     *
     * @param {string} moduleName - A named module to create
     */
    hx.Injector.prototype.get = function(moduleName) {
        var module = this.find(moduleName);

        if (!module) {
            throw new Error("Cannot find module with the name '" + moduleName + "'.");
        }

        return module();
    };
}());