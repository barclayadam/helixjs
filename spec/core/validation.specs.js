describe('validation', function () {
    describe('given a plain object', function () {
        describe('when making it validatable (mixin)', function () {
            beforeEach(function () {
                this.model = {};
                hx.validation.mixin(this.model);
            });

            it('should add a validate method', function () {
                expect(this.model.validate).toBeAFunction();
            });

            it('should add an isValid observable set to undefined', function () {
                expect(this.model.isValid).toBeObservable();
                expect(this.model.isValid()).toBeUndefined();
            });

            it('should add a validated observable set to false', function () {
                expect(this.model.validated).toBeObservable();
                expect(this.model.validated()).toBe(false);
            });
        });
    });

    describe('given a plain observable', function () {
        describe('when making it validatable (mixin)', function () {
            var property;

            beforeEach(function () {
                property = ko.observable();
                property.addValidationRules({
                    required: true
                });
            });

            it('should add a validate method', function () {
                expect(property.validate).toBeAFunction();
            });

            it('should add an isValid observable immediately set to correct state', function () {
                waitsFor(function() { return property.validating() === false; });

                runs(function() {
                    expect(property.isValid).toBeObservable();
                    expect(property.isValid()).toEqual(false);
                })
            });

            it('should add a validated observable set to false', function () {
                waitsFor(function() { return property.validating() === false; });

                runs(function() {
                    expect(property.validated).toBeObservable();
                    expect(property.validated()).toBe(false);
                })
            });

            describe('updating invalid property to be valid', function () {
                beforeEach(function () {
                    property('My Required Value');
                });

                it('should remove any errors to the errors property', function () {
                    waitsFor(function() { return property.validating() === false; });

                    runs(function() {
                        expect(property.errors().length).toEqual(0);
                    })
                });

                it('should mark the property as valid', function () {
                    waitsFor(function() { return property.validating() === false; });

                    runs(function() {
                        expect(property.isValid()).toEqual(true);
                    })
                });
            });
        });
    });

    describe('when observable wrapped in another observable', function () {
        var property;

        beforeEach(function() {
            property = ko.observable();
            property.addValidationRules({
                equalTo: 'value' // Pick a validator that depends on the 'real' value
            });
        })

        it('should add an isValid observable immediately set to correct state by unwrapping all children of observable', function () {
            expect(function () {
                property(ko.observable('value'))
            }).toThrow('Cannot set an observable value as the value of a validated observable');
        });
    });

    describe('validating a property - non async', function () {
        var property;

        beforeEach(function () {
            property = ko.observable();
            property.addValidationRules({
                required: true
            });
        });

        it('should mark property as having been validated', function (done) {
            property.validate().then(function() {
                expect(property.validated()).toBe(true);
            }).then(done);
        });

        it('should return a resolved promise with result of validation', function (done) {
            property.validate().then(function(r) {
                expect(r).toBe(false);
            }).then(done);
        });
    });

    describe('validating a property with async validator', function() {
        var property, resolver;

        beforeEach(function() {
            hx.validation.rules['asyncExample'] = {
                validator: function () {
                    return new Promise(function(resolve) {
                        resolver = resolve;
                    });
                },

                message: "This field is validated as async",
            }

            property = ko.observable();
            property.addValidationRules({
                asyncExample: true
            });
        })

        it('should set validating observable of property to true', function() {
            property.validate();
            expect(property.validating()).toBe(true);
        })

        it('should set validating to false when promise resolved', function(done) {
            resolver(false);

            property.validate().then(function() {
                expect(property.validating()).toBe(false);
            }).then(done);
        })

        it('should add an error if resolves to false', function(done) {
            resolver(false);

            property.validate().then(function() {
                expect(property.errors()).toContain('This field is validated as async');
            }).then(done);

        })

        it('should set isValid to false if resolves to false', function(done) {
            resolver(false);

            property.validate().then(function() {
                expect(property.isValid()).toBe(false);
            }).then(done);
        })

        it('should not an error if resolves to true', function(done) {
            resolver(true);

            property.validate().then(function() {
                expect(property.errors()).toEqual([]);
            }).then(done);
        })

        it('should set isValid to false if resolves to true', function(done) {
            resolver(true);

            property.validate().then(function() {
                expect(property.isValid()).toBe(true);
            }).then(done);
        })
    });

    describe('validating a property with multiple async validators', function() {
        var property, resolver1, resolver2;

        beforeEach(function() {
            hx.validation.rules['asyncExample1'] = {
                validator: function () {
                    return new Promise(function(resolve) {
                        resolver1 = resolve;
                    });
                },

                message: "This field is validated as async - example1",
            }

            hx.validation.rules['asyncExample2'] = {
                validator: function () {                    
                    return new Promise(function(resolve) {
                        resolver2 = resolve;
                    });
                },

                message: "This field is validated as async - example2",
            }

            property = ko.observable();

            property.addValidationRules({
                asyncExample1: true,
                asyncExample2: true
            });
        })

        it('should not set errors if only one has resolved', function() {
            resolver1(true);

            expect(property.errors()).toEqual([]);
        })

        it('should keep validating as true if only one resolves', function() {
            resolver1(true);

            expect(property.validating()).toBe(true);
        })

        it('should mark validating as false when all resolve', function(done) {
            resolver1(true);
            resolver2(true);

            property.validate().then(function() {
                expect(property.validating()).toBe(false);
            }).then(done);
        })

        it('should add errors of any resolved as false', function(done) {
            resolver1(true);
            resolver2(false);

            property.validate().then(function() {
                expect(property.errors().length).toBe(1);
                expect(property.errors()).toContain('This field is validated as async - example2');
            }).then(done);
        })
    })

    describe('adding validation rules multiple times', function () {
        var property;

        beforeEach(function () {
            property = ko.observable('a');
            
            property.addValidationRules({
                minLength: 2
            });

            property.addValidationRules({
                equalTo: 'b'
            });
        });

        it('should include errors for each added rule', function (done) {
            property.validate().then(function() {
                expect(property.errors().length).toBe(2);
            }).then(done);
        });
    });

    describe('validating a property with validator that has observable dependencies', function () {
        var property;

        beforeEach(function () {
            this.validatorDependency = validatorDependency = ko.observable(false);

            hx.validation.rules.withObservableDependency = {
                validator: function () {
                    return validatorDependency();
                }
            };

            property = ko.observable('a');
            property.addValidationRules({
                withObservableDependency: true
            });
        });

        it('should reevaulate isValid after dependency changes', function (done) {
            property.validate().then(function() {
                expect(property.isValid()).toBe(this.validatorDependency());
            });

            // Flip the dependency, the value of which becomes isValid for this validator
            this.validatorDependency(!this.validatorDependency())

            property.validate().then(function() {
                expect(property.isValid()).toBe(this.validatorDependency());
            }).then(done);
        });
    });

    describe('validating a model', function () {
        describe('with no defined observable properties', function () {
            var model = {};

            beforeEach(function () {
                hx.validation.mixin(model);
            });

            it('should set isValid to true', function (done) {
                model.validate().then(function() {
                    expect(model.isValid()).toBe(true);
                }).then(done);
            });

            it('should set validated observable to true', function (done) {
                model.validate().then(function() {
                    expect(model.validated()).toBe(true);
                }).then(done);
            });
        });

        describe('with undefined properties', function () {
            var model;
            beforeEach(function () {
                model = {
                    property1: void 0,
                    property2: ko.observable('Valid Value').addValidationRules({
                        required: true
                    })
                };
                hx.validation.mixin(model);
            });

            it('should set isValid to true', function (done) {
                model.validate().then(function() {
                    expect(model.isValid()).toBe(true);
                }).then(done);
            });
        });

        describe('with validatable properties', function () {
            function createModel(values) {
                var model = {
                    property1: ko.observable(values.property1).addValidationRules({
                        required: true
                    }),
                    property2: ko.observable(values.property2).addValidationRules({
                        required: true,
                        requiredMessage: 'This is a custom message'
                    })
                };

                hx.validation.mixin(model);
                model.validate();
                
                return model;
            };

            describe('when observable wrapped in another observable', function () {
                var model, realProperty;

                beforeEach(function() {
                    realProperty = ko.observable().addValidationRules({
                            required: true,
                            requiredMessage: 'This is a custom message'
                        });

                    model = {
                        wrapper: ko.observable(realProperty)
                    };

                    hx.validation.mixin(model);
                })

                it('should keep unwrapping until reaches real observable value', function (done) {
                    model.validate().then(function() {
                        expect(realProperty.isValid()).toBe(false)
                    }).then(done);
                })
            });

            describe('when all properties are valid', function () {
                var model;

                beforeEach(function () {
                    model = createModel({
                        property1: 'A Value',
                        property2: 'A Value'
                    });
                });

                it('should set isValid to true', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(true);
                    }).then(done);
                });

                it('should set validated observable to true', function (done) {
                    model.validate().then(function() {
                        expect(model.validated()).toBe(true);
                    }).then(done);
                });
            });

            describe('when single property is invalid', function () {
                var model;

                beforeEach(function () {
                    model = createModel({
                        property1: 'A Value'
                    });
                });

                it('should set isValid of the model to false', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should set validated observable to true', function (done) {
                    model.validate().then(function() {
                        expect(model.validated()).toBe(true);
                    }).then(done);
                });

                it('should not add error message to errors property of valid observable',function (done) {
                    model.validate().then(function() {
                        expect(model.property1.errors().length).toBe(0);
                    }).then(done);
                });

                it('should set isValid to true for the valid property', function (done) {
                    model.validate().then(function() {
                        expect(model.property1.isValid()).toBe(true);
                    }).then(done);
                });

                it('should add error message to errors property of invalid observable', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.errors().length).toBe(1);
                    }).then(done);
                });

                it('should set isValid to false for the invalid property', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.isValid()).toBe(false);
                    }).then(done);
                });

                it('should use custom message if specified', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.errors()[0]).toEqual('This is a custom message');
                    }).then(done);
                });
            });

            describe('when values are updated to make them valid', function () {
                var model;

                beforeEach(function () {
                    model = createModel({
                        property1: 'A Value'
                    });

                    model.property2('A Value');
                });

                it('should set isValid of the model to true', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(true);
                    }).then(done);
                });

                it('should set isValid to true for the now valid property', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.isValid()).toBe(true);
                    }).then(done);
                });

                it('should remove error message from the invalid observable', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.errors().length).toBe(0);
                    }).then(done);
                });

                it('should set isValid to true for the now valid property', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.isValid()).toBe(true);
                    }).then(done);
                });
            });

            describe('when multiples properties are invalid', function () {
                var model;

                beforeEach(function () {
                    model = createModel({});
                });

                it('should set isValid of the model to false', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should add error messages to errors property of all invalid observable', function (done) {
                    model.validate().then(function() {
                        expect(model.property1.errors().length).toBe(1);
                        expect(model.property2.errors().length).toBe(1);
                    }).then(done);
                });

                it('should set isValid to false for all inalid properties', function (done) {
                    model.validate().then(function() {
                        expect(model.property1.isValid()).toBe(false);
                        expect(model.property2.isValid()).toBe(false);
                    }).then(done);
                });
            });

            describe('when array property has no validationRules', function () {
                var model;

                beforeEach(function () {
                    model = createModel({
                        property1: 'A Value',
                        property2: []
                    });
                });

                it('should set isValid to true', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(true);
                    }).then(done);
                });
            });

            describe('when array property has validationRules that are broken', function () {
                var model;

                beforeEach(function () {
                    model = {
                        arrayProp: ko.observable([]).addValidationRules({
                            minLength: 2
                        })
                    };

                    hx.validation.mixin(model);
                });

                it('should set isValid of the model to false',function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should set isValid of the array property to false', function (done) {
                    model.validate().then(function() {
                        expect(model.arrayProp.isValid()).toBe(false);
                    }).then(done);
                });

                it('should add error message to the array property error observable', function (done) {
                    model.validate().then(function() {
                        expect(model.arrayProp.errors().length).toBe(1);
                    }).then(done);
                });

                describe('and child validatables with one failing', function () {
                    var model;

                    beforeEach(function () {
                        function makeArrayValue(value) {
                            return ko.observable(value).addValidationRules({
                                required: true
                            });
                        };
                        
                        var array = [makeArrayValue('A Value'), makeArrayValue(void 0), makeArrayValue('Another Value')];
                        
                        model = {
                            arrayProp: ko.observable(array).addValidationRules({
                                minLength: 2
                            })
                        };

                        hx.validation.mixin(model);
                    });

                    it('should set isValid of the model to false', function (done) {
                        model.validate().then(function() {
                            expect(model.isValid()).toBe(false);
                        }).then(done);
                    });

                    it('should set isValid of the valid child array property to true', function (done) {
                        model.validate().then(function() {
                            expect(model.arrayProp()[0].isValid()).toBe(true);
                            expect(model.arrayProp()[2].isValid()).toBe(true);
                        }).then(done);
                    });

                    it('should set isValid of the invalid child array property to false', function (done) {
                        model.validate().then(function() {
                            expect(model.arrayProp()[1].isValid()).toBe(false);
                        }).then(done);
                    });
                });
            });

            describe('when array property has child validatables with one failing', function () {
                var model;

                beforeEach(function () {
                    function makeArrayValue(value) {
                        return ko.observable(value).addValidationRules({
                            required: true
                        });
                    };
                    
                    var array = [makeArrayValue('A Value'), makeArrayValue(void 0), makeArrayValue('Another Value')];
                    model = hx.validation.newModel({
                        arrayProp: ko.observable(array)
                    });
                });

                it('should set isValid of the model to false', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should set isValid of the valid child array property to true', function (done) {
                    model.validate().then(function() {
                        expect(model.arrayProp()[0].isValid()).toBe(true);
                        expect(model.arrayProp()[2].isValid()).toBe(true);
                    }).then(done);
                });

                it('should set isValid of the invalid child array property to false', function (done) {
                    model.validate().then(function() {
                        expect(model.arrayProp()[1].isValid()).toBe(false);
                    }).then(done);
                });
            });

            describe('when plain child object has validatables with one failing', function () {
                var model;

                beforeEach(function () {
                    model = {
                        child: {
                            childProperty: ko.observable().addValidationRules({
                                required: true
                            })
                        }
                    };

                    hx.validation.mixin(model);
                });

                it('should set isValid of the model to false', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should set isValid of the invalid child property to false', function (done) {
                    model.validate().then(function() {
                        expect(model.child.childProperty.isValid()).toBe(false);
                    }).then(done);
                });
            });

            describe('when observable child object has validatables with one failing', function () {
                var model;

                beforeEach(function () {
                    var child = {
                        childProperty: ko.observable().addValidationRules({
                            required: true
                        })
                    };

                    model = {
                        child: ko.observable(child)
                    };

                    hx.validation.mixin(model);
                });

                it('should set isValid of the model to false', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(false);
                    }).then(done);
                });

                it('should set isValid of the invalid child property to false', function (done) {
                    model.validate().then(function() {
                        expect(model.child().childProperty.isValid()).toBe(false);
                    }).then(done);
                });
            });

            describe('when only server-side errors are set', function () {
                var model;

                beforeEach(function () {
                    model = createModel({
                        property1: 'A Value',
                        property2: 'A Value'
                    });

                    model.setServerErrors({
                        property1: 'property1 is invalid on server',
                        _: 'The whole form is somehow invalid'
                    });
                });

                it('should set isValid to true', function (done) {
                    model.validate().then(function() {
                        expect(model.isValid()).toBe(true);
                    }).then(done);
                });

                it('should set non-property error messages on serverErrors of model', function (done) {
                    model.validate().then(function() {
                        expect(model.serverErrors()).toEqual(['The whole form is somehow invalid']);
                    }).then(done);
                });

                it('should set property error messages on serverErrors of property', function (done) {
                    model.validate().then(function() {
                        expect(model.property1.serverErrors()).toEqual(['property1 is invalid on server']);
                    }).then(done);
                });

                it('should set isValid of property with server-side errors to true', function (done) {
                    model.validate().then(function() {
                        expect(model.property1.isValid()).toBe(true);
                    }).then(done);
                });

                it('should set properties without serverErrors as having an empty array of server errors', function (done) {
                    model.validate().then(function() {
                        expect(model.property2.serverErrors()).toEqual([]);
                    }).then(done);
                });

                it('should clear the server errors of the property when property updated', function () {
                    model.property1('A New Value');

                    waitsFor(function() { return model.property1.validating() === false; })

                    runs(function() {
                        expect(model.property1.serverErrors()).toBeAnEmptyArray();
                    });
                });

                it('should clear the server errors of the model when validated again', function (done) {
                    model.validate().then(function() {
                        expect(this.model.serverErrors()).toBeAnEmptyArray();
                    }).then(done);
                });
            });
        });

        describe('with explicitly included properties', function () {
            var model;

            beforeEach(function () {
                model = {
                    ignoredProperty: ko.observable().addValidationRules({ required: true }),
                    includedProperty: ko.observable('a value').addValidationRules({ required: true })
                };

                hx.validation.mixin(model, ['includedProperty']);
            });

            it('should not validate properties not in inclusion list', function (done) {
                model.validate().then(function() {
                    expect(model.ignoredProperty.validated()).toBe(false);
                }).then(done);
            });

            it('should validate properties in inclusion list', function (done) {
                model.validate().then(function() {
                    expect(model.includedProperty.validated()).toBe(true);
                }).then(done);
            });
        });

        describe('messaging', function () {
            var model;

            beforeEach(function () {
                hx.validation.rules.myCustomRule = {
                    validator: function () {
                        return false;
                    },

                    message: this.stub().returns('myCustomRule message')
                };

                this.asyncDeferred = asyncDeferred = new $.Deferred();

                model = {
                    customMessageProp: ko.observable().addValidationRules({
                        required: true,
                        requiredMessage: 'My custom failure message'
                    }),

                    customPropertyNameProp: ko.observable().addValidationRules({
                        required: true,
                        propertyName: 'myOverridenPropertyName'
                    }),

                    customRuleProp: ko.observable().addValidationRules({
                        myCustomRule: true
                    }),

                    asyncMessageProp: ko.observable().addValidationRules({
                        custom: function() {
                            return asyncDeferred;
                        },

                        customMessage: 'This is the async failure',

                    })
                };

                hx.validation.mixin(model);
            });

            it('should use message specified in rules', function (done) {
                model.validate().then(function() {
                    expect(this.model.customMessageProp.errors()).toContain('My custom failure message');
                }).then(done);
            });

            it('should call rule message property if no overrides', function (done) {
                model.validate().then(function() {
                    expect(hx.validation.rules.myCustomRule.message).toHaveBeenCalledWith(true);
                }).then(done);
            });

            it('should not format error messages by default', function (done) {
                model.validate().then(function() {
                    expect(this.model.customRuleProp.errors()).toContain('myCustomRule message');
                }).then(done);
            });

            it('should correctly use message when custom validator is async', function (done) {
                model.validate().then(function() {
                    // We want to simulate async that is not resolved immediately, resolve it here
                    asyncDeferred.resolve(false);

                    expect(this.model.asyncMessageProp.errors()).toContain('This is the async failure');
                }).then(done);
            });
        });
    });
});