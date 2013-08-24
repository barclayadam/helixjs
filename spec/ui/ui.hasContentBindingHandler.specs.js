describe('has content binding handler', function() {
    beforeEach(function() {
        this.setHtmlFixture("<div>" +
                            " <input id='validated-input' type='text' data-bind='value: value' />" +
                            " <textarea id='validated-textarea' type='text' data-bind='value: value'></textarea>" +
                            " <input id='validated-input-explicit' type='text' data-bind='hasContent: value'></span>" +
                            "</div>");

        this.value = ko.observable();

        this.applyBindingsToFixture({
            value: this.value
        });
    });

    function checkInputType(inputType) {
        describe(inputType, function() {
            it('should not apply class has-content if value is undefined', function() {
                this.value(undefined);
                expect(document.getElementById('validated-' + inputType)).not.toHaveClass('has-content');
            })

            it('should not apply class has-content when value is null', function() {
                this.value(null);
                expect(document.getElementById('validated-' + inputType)).not.toHaveClass('has-content');
            })

            it('should not apply class has-content when value is empty', function() {
                this.value('');
                expect(document.getElementById('validated-' + inputType)).not.toHaveClass('has-content');
            })

            it('should apply class has-content when value is not empty', function() {
                this.value('a value');
                expect(document.getElementById('validated-' + inputType)).toHaveClass('has-content');
            })
        })
    }

    checkInputType('input');
    checkInputType('textarea');
    checkInputType('input-explicit');
})