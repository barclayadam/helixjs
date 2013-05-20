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
            beforeEach(function () {
                this.property = ko.observable();
                this.property.addValidationRules({
                    required: true
                });
            });

            it('should add a validate method', function () {
                expect(this.property.validate).toBeAFunction();
            });

            it('should add an isValid observable immediately set to correct state', function () {
                expect(this.property.isValid).toBeObservable();
                expect(this.property.isValid()).toEqual(false);
            });

            it('should add a validated observable set to false', function () {
                expect(this.property.validated).toBeObservable();
                expect(this.property.validated()).toBe(false);
            });

            describe('updating invalid property to be valid', function () {
                beforeEach(function () {
                    this.property('My Required Value');
                });
                it('should remove any errors to the errors property', function () {
                    expect(this.property.errors().length).toEqual(0);
                });
                it('should mark the property as valid', function () {
                    expect(this.property.isValid()).toEqual(true);
                });
            });
        });
    });

    describe('validating a property', function () {
        beforeEach(function () {
            this.property = ko.observable();
            this.property.addValidationRules({
                required: true
            });
            this.property.validate();
        });

        it('should mark property as being validated', function () {
            expect(this.property.validated()).toBe(true);
        });
    });

    describe('adding validation rules multiple times', function () {
        beforeEach(function () {
            this.property = ko.observable('a');
            this.property.addValidationRules({
                minLength: 2
            });
            this.property.addValidationRules({
                equalTo: 'b'
            });
        });

        it('should include errors for each added rule', function () {
            expect(this.property.errors().length).toBe(2);
        });
    });

    describe('validating a model', function () {
        describe('with no defined observable properties', function () {
            beforeEach(function () {
                this.model = {};
                hx.validation.mixin(this.model);
                this.model.validate();
            });

            it('should set isValid to true', function () {
                expect(this.model.isValid()).toBe(true);
            });

            it('should set validated observable to true', function () {
                expect(this.model.validated()).toBe(true);
            });
        });

        describe('with undefined properties', function () {
            beforeEach(function () {
                this.model = {
                    property1: void 0,
                    property2: ko.observable('Valid Value').addValidationRules({
                        required: true
                    })
                };
                hx.validation.mixin(this.model);
                this.model.validate();
            });

            it('should set isValid to true', function () {
                expect(this.model.isValid()).toBe(true);
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
                beforeEach(function() {
                    this.realProperty = ko.observable().addValidationRules({
                            required: true,
                            requiredMessage: 'This is a custom message'
                        });

                    this.model = {
                        wrapper: ko.observable(this.realProperty)
                    };

                    hx.validation.mixin(this.model);
                    this.model.validate();
                })

                it('should keep unwrapping until reaches real observable value', function() {
                    expect(this.realProperty.isValid()).toBe(false)
                })
            });

            describe('when all properties are valid', function () {
                beforeEach(function () {
                    this.model = createModel({
                        property1: 'A Value',
                        property2: 'A Value'
                    });
                });

                it('should set isValid to true', function () {
                    expect(this.model.isValid()).toBe(true);
                });

                it('should set validated observable to true', function () {
                    expect(this.model.validated()).toBe(true);
                });
            });

            describe('when single property is invalid', function () {
                beforeEach(function () {
                    this.model = createModel({
                        property1: 'A Value'
                    });
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should set validated observable to true', function () {
                    expect(this.model.validated()).toBe(true);
                });

                it('should not add error message to errors property of valid observable', function () {
                    expect(this.model.property1.errors().length).toBe(0);
                });

                it('should set isValid to true for the valid property', function () {
                    expect(this.model.property1.isValid()).toBe(true);
                });

                it('should add error message to errors property of invalid observable', function () {
                    expect(this.model.property2.errors().length).toBe(1);
                });

                it('should set isValid to false for the invalid property', function () {
                    expect(this.model.property2.isValid()).toBe(false);
                });

                it('should use custom message if specified', function () {
                    expect(this.model.property2.errors()[0]).toEqual('This is a custom message');
                });
            });

            describe('when values are updated to make them valid', function () {
                beforeEach(function () {
                    this.model = createModel({
                        property1: 'A Value'
                    });

                    this.model.property2('A Value');
                });

                it('should set isValid of the model to true', function () {
                    expect(this.model.isValid()).toBe(true);
                });

                it('should set isValid to true for the now valid property', function () {
                    expect(this.model.property2.isValid()).toBe(true);
                });

                it('should remove error message from the invalid observable', function () {
                    expect(this.model.property2.errors().length).toBe(0);
                });

                it('should set isValid to true for the now valid property', function () {
                    expect(this.model.property2.isValid()).toBe(true);
                });
            });

            describe('when multiples properties are invalid', function () {
                beforeEach(function () {
                    this.model = createModel({});
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should add error messages to errors property of all invalid observable', function () {
                    expect(this.model.property1.errors().length).toBe(1);
                    expect(this.model.property2.errors().length).toBe(1);
                });

                it('should set isValid to false for all inalid properties', function () {
                    expect(this.model.property1.isValid()).toBe(false);
                    expect(this.model.property2.isValid()).toBe(false);
                });
            });

            describe('when array property has no validationRules', function () {
                beforeEach(function () {
                    this.model = createModel({
                        property1: 'A Value',
                        property2: []
                    });
                });

                it('should set isValid to true', function () {
                    expect(this.model.isValid()).toBe(true);
                });
            });

            describe('when array property has validationRules that are broken', function () {
                beforeEach(function () {
                    this.model = {
                        arrayProp: ko.observable([]).addValidationRules({
                            minLength: 2
                        })
                    };
                    hx.validation.mixin(this.model);
                    this.model.validate();
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should set isValid of the array property to false', function () {
                    expect(this.model.arrayProp.isValid()).toBe(false);
                });

                it('should add error message to the array property error observable', function () {
                    expect(this.model.arrayProp.errors().length).toBe(1);
                });

                describe('and child validatables with one failing', function () {
                    beforeEach(function () {
                        function makeArrayValue(value) {
                            return ko.observable(value).addValidationRules({
                                required: true
                            });
                        };
                        
                        var array = [makeArrayValue('A Value'), makeArrayValue(void 0), makeArrayValue('Another Value')];
                        
                        this.model = {
                            arrayProp: ko.observable(array).addValidationRules({
                                minLength: 2
                            })
                        };
                        hx.validation.mixin(this.model);
                        this.model.validate();
                    });

                    it('should set isValid of the model to false', function () {
                        expect(this.model.isValid()).toBe(false);
                    });

                    it('should set isValid of the valid child array property to true', function () {
                        expect(this.model.arrayProp()[0].isValid()).toBe(true);
                        expect(this.model.arrayProp()[2].isValid()).toBe(true);
                    });

                    it('should set isValid of the invalid child array property to false', function () {
                        expect(this.model.arrayProp()[1].isValid()).toBe(false);
                    });
                });
            });

            describe('when array property has child validatables with one failing', function () {
                beforeEach(function () {
                    function makeArrayValue(value) {
                        return ko.observable(value).addValidationRules({
                            required: true
                        });
                    };
                    
                    var array = [makeArrayValue('A Value'), makeArrayValue(void 0), makeArrayValue('Another Value')];
                    this.model = hx.validation.newModel({
                        arrayProp: ko.observable(array)
                    });

                    this.model.validate();
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should set isValid of the valid child array property to true', function () {
                    expect(this.model.arrayProp()[0].isValid()).toBe(true);
                    expect(this.model.arrayProp()[2].isValid()).toBe(true);
                });

                it('should set isValid of the invalid child array property to false', function () {
                    expect(this.model.arrayProp()[1].isValid()).toBe(false);
                });
            });
            describe('when plain child object has validatables with one failing', function () {
                beforeEach(function () {
                    this.model = {
                        child: {
                            childProperty: ko.observable().addValidationRules({
                                required: true
                            })
                        }
                    };

                    hx.validation.mixin(this.model);
                    this.model.validate();
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should set isValid of the invalid child property to false', function () {
                    expect(this.model.child.childProperty.isValid()).toBe(false);
                });
            });

            describe('when observable child object has validatables with one failing', function () {
                beforeEach(function () {
                    var child = {
                        childProperty: ko.observable().addValidationRules({
                            required: true
                        })
                    };

                    this.model = {
                        child: ko.observable(child)
                    };

                    hx.validation.mixin(this.model);
                    this.model.validate();
                });

                it('should set isValid of the model to false', function () {
                    expect(this.model.isValid()).toBe(false);
                });

                it('should set isValid of the invalid child property to false', function () {
                    expect(this.model.child().childProperty.isValid()).toBe(false);
                });
            });

            describe('when only server-side errors are set', function () {
                beforeEach(function () {
                    this.model = createModel({
                        property1: 'A Value',
                        property2: 'A Value'
                    });
                    this.model.setServerErrors({
                        property1: 'property1 is invalid on server',
                        _: 'The whole form is somehow invalid'
                    });
                });

                it('should set isValid to true', function () {
                    expect(this.model.isValid()).toBe(true);
                });

                it('should set non-property error messages on serverErrors of model', function () {
                    expect(this.model.serverErrors()).toEqual(['The whole form is somehow invalid']);
                });

                it('should set property error messages on serverErrors of property', function () {
                    expect(this.model.property1.serverErrors()).toEqual(['property1 is invalid on server']);
                });

                it('should set isValid of property with server-side errors to true', function () {
                    expect(this.model.property1.isValid()).toBe(true);
                });

                describe('and property value is updated', function () {
                    beforeEach(function () {
                        this.model.property1('A New Value');
                    });

                    it('should clear the server errors of the property', function () {
                        expect(this.model.property1.serverErrors()).toBeAnEmptyArray();
                    });
                });

                describe('and model is validated again', function () {
                    beforeEach(function () {
                        this.model.validate();
                    });

                    it('should clear the server errors of the model', function () {
                        expect(this.model.serverErrors()).toBeAnEmptyArray();
                    });
                });
            });
        });

        describe('messaging', function () {
            beforeEach(function () {
                hx.validation.rules.myCustomRule = {
                    validator: function () {
                        false;
                    },
                    message: this.stub().returns('myCustomRule message')
                };

                this.model = {
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
                    })
                };
                
                hx.validation.mixin(this.model);
                this.model.validate();
            });

            it('should use message specified in rules', function () {
                expect(this.model.customMessageProp.errors()).toContain('My custom failure message');
            });

            it('should call rule message property if no overrides', function () {
                expect(hx.validation.rules.myCustomRule.message).toHaveBeenCalledWith(true);
            });

            it('should not format error messages by default', function () {
                expect(this.model.customRuleProp.errors()).toContain('myCustomRule message');
            });
        });
    });
});