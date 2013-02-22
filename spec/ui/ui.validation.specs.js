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
                                    "</div>");

                this.validatedObservable = ko.observable('a value').addValidationRules({ required: true });
                this.spy(hx.validation.rules.required, 'modifyElement');

                this.applyBindingsToFixture({
                    validated: this.validatedObservable
                });
            });

            function checkInputType(inputType) {
                describe(inputType, function() {
                    it('should apply an aria-invalid property immediately on ' + inputType, function() {
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
                })
            }

            checkInputType('input');
            checkInputType('select');
            checkInputType('textarea');
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

        it('should have no text if applied to a valid observable', function() {
            expect(document.getElementById('validation-message')).toBeEmpty();
            expect(document.getElementById('validation-message-span')).toBeEmpty();
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
})