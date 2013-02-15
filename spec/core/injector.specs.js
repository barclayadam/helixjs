describe('injector', function() {
    beforeEach(function() {
        this.injector = new hx.Injector();
    })

    describe('creating non-named items with no dependencies', function() {
        it('should execute function passed in', function() {
            var expectedResult = "This is the result",
                result = this.injector.create(function() {
                    return expectedResult;
                });

            expect(result).toBe(expectedResult);
        })

        it('should return object passed in', function() {
            var expectedResult = { value: "This is the result" },
                result = this.injector.create(expectedResult);

            expect(result).toBe(expectedResult);
        })

        it('should return null if null passed in', function() {
            var result = this.injector.create(null);

            expect(result).toBeNull();
        })
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
            var result = this.injector.create('$myTestModule');

            expect(result).toBe(this.moduleReturnValue);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.create('$MYTESTMODULE');

            expect(result).toBe(this.moduleReturnValue);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.create(' $myTestModule ');

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
            var result = this.injector.create('$myTestModule');

            expect(result).toBe(this.moduleDefinition);
        })

        it('should return the registered module as-is when creating with differently-cased name', function() {
            var result = this.injector.create('$MYTESTMODULE');

            expect(result).toBe(this.moduleDefinition);
        })

        it('should return the registered module as-is when creating with name with extra spaces', function() {
            var result = this.injector.create(' $myTestModule ');

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
            var result = this.injector.create('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.create('$MYTESTMODULE');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.create(' $myTestModule ');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn)
            expect(result).toBe(this.dependentModuleReturn);
        })
    })

    describe('with registered module with multiple dependency', function() {
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
            var result = this.injector.create('$myTestModule');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with differently-cased name', function() {
            var result = this.injector.create('$MYTESTMODULE');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })

        it('should execute the registered function when creating with name with extra spaces', function() {
            var result = this.injector.create(' $myTestModule ');

            expect(this.dependentModuleStub).toHaveBeenCalledWith(this.dependencyAReturn, this.dependencyBReturn);
            expect(result).toBe(this.dependentModuleReturn);
        })
    })
})