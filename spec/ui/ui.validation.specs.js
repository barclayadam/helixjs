describe('validation - ui', function() {
    describe('inputs', function() {
        describe('a non-validatable observable', function() {
            beforeEach(function() {
                this.setHtmlFixture("<div>" +
                                    " <input id='non-validated-input' type='text' data-bind='value: nonValidated' />" +
                                    "</div>");
                
                this.applyBindingsToFixture({
                    nonValidated: ko.observable('a value')
                });
            });

            it('should not apply an aria-invalid property', function() {
                expect(document.getElementById('non-validated-input')).not.toHaveAttr('aria-invalid', null);
            })
        })

        describe('a validatable observable', function() {
            beforeEach(function() {
                this.setHtmlFixture("<div>" +
                                    " <input id='validated-input' type='text' data-bind='value: validated' />" +
                                    " <select id='validated-select' type='text' data-bind='value: validated' />" +
                                    " <textarea id='validated-textarea' type='text' data-bind='value: validated'></textarea>" +
                                    " <span id='validated-span' type='text' data-bind='validated: validated'></span>" +
                                    " <input id='validated-input-explicit' type='text' data-bind='validated: validated'></span>" +
                                    "</div>");

                this.validatedObservable = ko.observable('a value').addValidationRules({ required: true, requiredMessage: 'This is my message' });
                this.spy(hx.validation.rules.required, 'modifyElement');

                this.applyBindingsToFixture({
                    validated: this.validatedObservable
                });
            });

            function checkInputType(inputType) {
                describe(inputType, function() {
                    it('should apply an aria-invalid property immediately', function() {
                        expect(document.getElementById('validated-' + inputType)).toHaveAttr('aria-invalid', 'false');
                    })

                    it('should not immediately add a validated class', function() {
                        expect(document.getElementById('validated-' + inputType)).not.toHaveClass('validated')
                    })

                    it('should add a validated class when the validatable has been marked as validated', function() {
                        this.validatedObservable.validate();

                        expect(document.getElementById('validated-' + inputType)).toHaveClass('validated')
                    })

                    it('should call modifyElement of the applied rules if applicable', function() {
                        expect(hx.validation.rules.required.modifyElement).toHaveBeenCalledWith(document.getElementById('validated-' + inputType), true)
                    })

                    it('should add is-validating class when property is validating', function() {
                        // Clear value, making it invalid as set as required
                        this.validatedObservable.validating(true);

                        expect(document.getElementById('validated-' + inputType)).toHaveClass('is-validating')
                    })  
                })
            }

            checkInputType('input');
            checkInputType('select');
            checkInputType('textarea');
            checkInputType('span');
            checkInputType('input-explicit');
        })
    })

    describe('messages', function() {
        beforeEach(function() {
            this.setHtmlFixture("<div>" +
                                " <validationMessage id='validation-message-non-validated' data-option='nonValidated'>Some error message</validationMessage>" +
                                " <validationMessage id='validation-message-with-override' data-option='validated'>Some error message</validationMessage>" +
                                " <validationMessage id='validation-message' data-option='validated'></validationMessage>" +
                                " <span id='validation-message-span' data-bind='validationMessage: validated'></span>" +
                                "</div>");
            
            this.nonValidated = ko.observable('a value');
            this.validated = ko.observable('a value').addValidationRules({ required: true, requiredMessage: 'My required message' });

            this.applyBindingsToFixture({
                nonValidated: this.nonValidated,
                validated: this.validated
            });
        });

        it('should have no text if applied to a non-validatable observable', function() {
            expect(document.getElementById('validation-message-non-validated')).toBeEmpty();
        })

        it('should add validation-message class when given a validatable observable', function() {
            expect(document.getElementById('validation-message')).toHaveClass('validation-message');
            expect(document.getElementById('validation-message-with-override')).toHaveClass('validation-message');
            expect(document.getElementById('validation-message-span')).toHaveClass('validation-message');
        })

        it('should have text "Valid" if applied to a valid observable', function() {
            expect(document.getElementById('validation-message')).toHaveText('Valid');
            expect(document.getElementById('validation-message-span')).toHaveText('Valid');
        })   

        it('should add valid class when observable is valid', function() {
            expect(document.getElementById('validation-message')).toHaveClass('valid');
            expect(document.getElementById('validation-message-with-override')).toHaveClass('valid');
            expect(document.getElementById('validation-message-span')).toHaveClass('valid');
        })        

        it('should add invalid class when observable is invalid', function() {
            // Clear value, making it invalid as set as required
            this.validated(undefined);

            expect(document.getElementById('validation-message')).toHaveClass('invalid');
            expect(document.getElementById('validation-message-with-override')).toHaveClass('invalid');
            expect(document.getElementById('validation-message-span')).toHaveClass('invalid');
        })        

        it('should remove valid class when observable is invalid', function() {
            // Clear value, making it invalid as set as required
            this.validated(undefined);

            expect(document.getElementById('validation-message')).not.toHaveClass('valid');
            expect(document.getElementById('validation-message-with-override')).not.toHaveClass('valid');
            expect(document.getElementById('validation-message-span')).not.toHaveClass('valid');
        })           

        it('should add is-validating class when property is validating', function() {
            // Clear value, making it invalid as set as required
            this.validated.validating(true);

            expect(document.getElementById('validation-message')).toHaveClass('is-validating');
            expect(document.getElementById('validation-message-with-override')).toHaveClass('is-validating');
            expect(document.getElementById('validation-message-span')).toHaveClass('is-validating');
        })  

        it('should set text content to the error message', function() {
            // Clear value, making it invalid as set as required
            this.validated(undefined);

            expect(document.getElementById('validation-message')).toHaveText('My required message');
            expect(document.getElementById('validation-message-span')).toHaveText('My required message');
        })  

        it('should not set text content to the error message if text already exists', function() {
            // Clear value, making it invalid as set as required
            this.validated(undefined);

            expect(document.getElementById('validation-message-with-override')).toHaveText('Some error message');
        })

        it('should add validated class only once the observable has been marked as validated', function() {
            expect(document.getElementById('validation-message')).not.toHaveClass('validated');

            // Clear value, making it invalid as set as required
            this.validated.validated(true);

            expect(document.getElementById('validation-message')).toHaveClass('validated');
        })
    })

    describe('error visibility', function() {
        beforeEach(function() {
            this.setHtmlFixture("<validationmessage id='password-validation-message' data-option='viewModel.password'></validationMessage>");
            
            this.viewModel = {
                password: ko.observable().addValidationRules({ required: true, requiredMessage: 'My required message' })
            }

            hx.validation.mixin(this.viewModel);

            this.applyBindingsToFixture({
                viewModel: this.viewModel
            });
        });

        describe('when server errors have not been set', function () {
            it('should show client errors only', function () {
                expect(document.getElementById('password-validation-message')).toHaveText('My required message');
            });

            it('should show nothing when client errors have been fixed', function () {
                this.viewModel.password('test');

                expect(document.getElementById('password-validation-message')).toHaveText('Valid');
            });            
        });

        describe('when server errors set', function () {
            beforeEach(function () {
                this.viewModel.setServerErrors({ password: 'Password is invalid' });
            });

            it('should show both client errors and server errors', function () {
                // Clear value, making it invalid as set as required
                this.viewModel.password(undefined);

                expect(document.getElementById('password-validation-message')).toHaveText('My required message<br />Password is invalid');
            });

            it('should clear server errors when value is updated', function () {
                this.viewModel.password('test');               

                expect(document.getElementById('password-validation-message')).toHaveText('Valid');
            }); 

            it('should show just server errors when client errors have been fixed', function () {
                this.viewModel.password('test');
                this.viewModel.setServerErrors({ password: 'Password is invalid' });                

                expect(document.getElementById('password-validation-message')).toHaveText('Password is invalid');
            }); 
        });         
    })
})