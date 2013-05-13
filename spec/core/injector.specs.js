describe('injector', function() {
    beforeEach(function() {
        this.injector = new hx.Injector();
    })

    it('should define an $injector service that returns itself', function() {
        expect(this.injector.get('$injector')).toBe(this.injector);
    })

    it('should throw a descriptive error if a named module cannot be found', function() {
        var injector = this.injector,
            throwingFunction = function() {
                injector.get('aDependenyThatDoesNotExist');
            };

        expect(throwingFunction).toThrow("Cannot find module with the name 'aDependenyThatDoesNotExist'.");
    })

    describe('with a single module registered as a function, with no dependencies', function() {
        beforeEach(function() {
            var moduleReturnValue = this.moduleReturnValue = {
                    aProperty: "This is my value"
                };

            this.injector.provide('$myTestModule', function() {
                return moduleReturnValue;
            });
        })

        it('should execute the registered function when creating with exact name', function() {
            var result = this.injector.get('$myTestModule');

            expect(result).toBe(this.moduleReturnValue);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.get('$MYTESTMODULE');

            expect(result).toBe(this.moduleReturnValue);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.get(' $myTestModule ');

            expect(result).toBe(this.moduleReturnValue);
        })
    })

    describe('with a single module registered as an object, with no dependencies', function() {
        beforeEach(function() {
            var moduleDefinition = this.moduleDefinition = {
                    aProperty: "This is my value"
                };

            this.injector.provide('$myTestModule', moduleDefinition);
        })

        it('should return the registered module as-is when creating with exact name', function() {
            var result = this.injector.get('$myTestModule');

            expect(result).toBe(this.moduleDefinition);
        })

        it('should return the registered module as-is when creating with differently-cased name', function() {
            var result = this.injector.get('$MYTESTMODULE');

            expect(result).toBe(this.moduleDefinition);
        })

        it('should return the registered module as-is when creating with name with extra spaces', function() {
            var result = this.injector.get(' $myTestModule ');

            expect(result).toBe(this.moduleDefinition);
        })
    })

    describe('with registered module with a single dependency', function() {
        beforeEach(function() {
            // Dependency A
            this.dependencyAReturn = { property: 'A Value'};
            this.injector.provide('$dependencyA', this.dependencyAReturn);

            // Dependent module
            this.dependentModuleReturn = { mainModuleProperty: 'The value' };
            this.dependentModuleStub = this.stub().returns(this.dependentModuleReturn);

            this.injector.provide('$myTestModule', '$dependencyA', this.dependentModuleStub);
        })

        it('should execute the registered function when creating with exact name, with injected dependencies', function() {
            var result = this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.get('$MYTESTMODULE');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.get(' $myTestModule ');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })
    })

    describe('with a registered singleton, with dependencies', function() {
        beforeEach(function() {
            // Dependency A
            this.dependencyAReturn = { property: 'A Value'};
            this.injector.provide('$dependencyA', this.dependencyAReturn);

            // Dependent module
            this.dependentModuleReturn = { mainModuleProperty: 'The value' };
            this.dependentModuleStub = this.stub().returns(this.dependentModuleReturn);

            this.injector.singleton('$myTestModule', '$dependencyA', this.dependentModuleStub);
        })

        it('should execute the registered function when creating the module, with injected dependencies', function() {
            var result = this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })
        
        it('should execute the registered function only once when created multiple times', function() {
            var result = this.injector.get('$myTestModule');

            // Execute again, should not call stub twice
            this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledOnce();
        })
        
        it('should return the same value on multiple invocations of creation', function() {
            var result = this.injector.get('$myTestModule'),
                result2 = this.injector.get('$myTestModule');

            expect(result).toBe(result2);
        })
    })

    describe('with a registered singleton, with no return value', function() {
        beforeEach(function() {
            // Dependency A
            this.dependencyAReturn = { property: 'A Value'};
            this.injector.provide('$dependencyA', this.dependencyAReturn);

            // Dependent module
            this.dependentModuleStub = this.stub();

            this.injector.singleton('$myTestModule', '$dependencyA', this.dependentModuleStub);
        })

        it('should execute the registered function when creating the module, with injected dependencies', function() {
            var result = this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })
        
        it('should execute the registered function only once when created multiple times', function() {
            var result = this.injector.get('$myTestModule');

            // Execute again, should not call stub twice
            this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledOnce();
        })
        
        it('should return the same value on multiple invocations of creation', function() {
            var result = this.injector.get('$myTestModule'),
                result2 = this.injector.get('$myTestModule');

            expect(result).toBe(result2);
        })
    })

    describe('with a registered singleton, with no dependencies', function() {
        beforeEach(function() {
            // Dependent module
            this.moduleReturn = { mainModuleProperty: 'The value' };
            this.moduleStub = this.stub().returns(this.moduleReturn);

            this.injector.singleton('$myTestModule', this.moduleStub);
        })

        it('should execute the registered function when creating the module, with injected dependencies', function() {
            var result = this.injector.get('$myTestModule');

            expect(this.moduleStub).toHaveBeenCalled();
            expect(result).toBe(this.moduleReturn);
        })
        
        it('should execute the registered function only once when created multiple times', function() {
            var result = this.injector.get('$myTestModule');

            // Execute again, should not call stub twice
            this.injector.get('$myTestModule');

            expect(this.moduleStub).toHaveBeenCalledOnce();
        })
        
        it('should return the same value on multiple invocations of creation', function() {
            var result = this.injector.get('$myTestModule'),
                result2 = this.injector.get('$myTestModule');

            expect(result).toBe(result2);
        })
    })

    describe('with a registered singleton, as an object literal', function() {
        beforeEach(function() {
            // Dependent module
            this.moduleReturn = { mainModuleProperty: 'The value' };

            this.injector.singleton('$myTestModule', this.moduleReturn);
        })

        it('should return the same value on multiple invocations of creation', function() {
            var result = this.injector.get('$myTestModule'),
                result2 = this.injector.get('$myTestModule');

            expect(result).toBe(result2);
        })        
    })

    describe('with registered module with multiple dependencies', function() {
        beforeEach(function() {
            // Dependency A
            this.dependencyAReturn = { property: 'A Value'};
            this.injector.provide('$dependencyA', this.dependencyAReturn);

            // Dependency B
            this.dependencyBReturn = { property: 'A Value'};
            this.injector.provide('$dependencyB', this.dependencyAReturn);

            // Dependent module
            this.dependentModuleReturn = { mainModuleProperty: 'The value' };
            this.dependentModuleStub = this.stub().returns(this.dependentModuleReturn);

            this.injector.provide('$myTestModule', ['$dependencyA', '$dependencyB'], this.dependentModuleStub);
        })

        it('should execute the registered function when creating with exact name, with injected dependencies', function() {
            var result = this.injector.get('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.get('$MYTESTMODULE');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.get(' $myTestModule ');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })
    })

    describe('annotating a function', function() {
        beforeEach(function() {
            // Dependency A
            this.dependencyAReturn = { property: 'A Value'};
            this.injector.provide('$dependencyA', this.dependencyAReturn);

            // Dependent module
            this.dependentModuleReturn = { mainModuleProperty: 'The value' };
            this.dependentModuleStub = this.stub().returns(this.dependentModuleReturn);

            this.dependentWithDependencyAnnotated = this.injector.annotate(['$dependencyA'], this.dependentModuleStub);

            // Non-Dependent module
            this.nonDependentModuleReturn = { mainModuleProperty: 'The value' };
            this.nonDependentModuleStub = this.stub().returns(this.nonDependentModuleReturn);

            this.withoutDependencyAnnotated = this.injector.annotate(this.nonDependentModuleStub);
        });

        it('should register dependencies to be fulfilled on creation / get', function() {
            var ret = this.dependentWithDependencyAnnotated();

            expect(ret).toBe(this.dependentModuleReturn);
            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
        })

        it('should work correctly with no dependencies', function() {
            var ret = this.withoutDependencyAnnotated();

            expect(ret).toBe(this.nonDependentModuleReturn);
            expect(this.nonDependentModuleStub).toHaveBeenCalled()
        })
    })
})