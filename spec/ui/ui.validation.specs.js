describe('validation - ui', function() {
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