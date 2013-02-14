var rules = hx.validation.rules;

function itShouldReturnTrueForEmptyValues(ruleName) {
    it('should true if property value is undefined', function () {
        var isValid;
        isValid = rules[ruleName].validator(void 0, true, {});
        expect(isValid).toBe(true);
    });
    
    it('should true if property value is null', function () {
        var isValid;
        isValid = rules[ruleName].validator(null, true, {});
        expect(isValid).toBe(true);
    });

    it('should true if property value is empty string', function () {
        var isValid;
        isValid = rules[ruleName].validator('', true, {});
        expect(isValid).toBe(true);
    });

    it('should true if property value is all spaces', function () {
        var isValid;
        isValid = rules[ruleName].validator('    ', true, {});
        expect(isValid).toBe(true);
    });
};

describe('Validation', function () {
    describe('With a required validator', function () {
        it('should true if property value is defined', function () {
            var isValid;
            isValid = rules.required.validator('My Value', true, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is undefined', function () {
            var isValid;
            isValid = rules.required.validator(void 0, true, {});
            expect(isValid).toBe(false);
        });
        it('should false if property value is null', function () {
            var isValid;
            isValid = rules.required.validator(null, true, {});
            expect(isValid).toBe(false);
        });
        it('should false if property value is empty string', function () {
            var isValid;
            isValid = rules.required.validator('', true, {});
            expect(isValid).toBe(false);
        });
        it('should false if property value is all spaces', function () {
            var isValid;
            isValid = hx.validation.rules.required.validator('    ', true, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.options = true;
                this.input = document.createElement('input');
                rules.required.modifyElement(this.input, this.options);
            });
            it('should set aria-required attribute to true', function () {
                expect(this.input).toHaveAttr('aria-required', 'true');
            });
            it('should set required attribute to true', function () {
                expect(this.input).toHaveAttr('required', 'required');
            });
        });
    });
    describe('With a regex validator', function () {
        itShouldReturnTrueForEmptyValues('regex');
        it('should true if property value matches regular expression', function () {
            var isValid;
            isValid = rules.regex.validator('01234', /[0-9]+/, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value does not match regular expression', function () {
            var isValid;
            isValid = rules.regex.validator('abc', /[0-9]+/, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.regex = /[0-9]+/;
                this.input = document.createElement('input');
                rules.regex.modifyElement(this.input, this.regex);
            });
            it('should set pattern attribute to regex', function () {
                expect(this.input).toHaveAttr('pattern', this.regex.toString());
            });
        });
    });
    describe('with a email validator', function () {
        var defineTest;
        itShouldReturnTrueForEmptyValues('email');
        defineTest = function (expected, email) {
            it("should " + expected + " if property value is '" + email + "'", function () {
                var isValid;
                isValid = rules.email.validator(email, true, {});
                expect(isValid).toBe(expected);
            });
        };
        defineTest(true, "test@127.0.0.1");
        defineTest(true, "test@example.com");
        defineTest(true, "test@subdomain.domain.com");
        defineTest(true, "test++example@subdomain.domain.com");
        defineTest(false, "test@...");
        defineTest(false, "test");
        defineTest(false, "test@");
    });
    describe('with a postcode validator', function () {
        var defineTest;
        itShouldReturnTrueForEmptyValues('postcode');
        defineTest = function (expected, postcode) {
            it("should " + expected + " if property value is '" + postcode + "'", function () {
                var isValid;
                isValid = rules.postcode.validator(postcode, true, {});
                expect(isValid).toBe(expected);
            });
        };
        defineTest(true, "PO112EF");
        defineTest(true, "WN12 4FR");
        defineTest(true, "GIR 0AA");
        defineTest(true, "GIR0AA");
        defineTest(true, "PO3 6JZ");
        defineTest(true, "PO36JZ");
        defineTest(false, "QWERTY");
        defineTest(false, "PO12");
        defineTest(false, "P012");
    });
    describe('With a minLength validator', function () {
        itShouldReturnTrueForEmptyValues('minLength');
        it('should true if property is string with required number of characters', function () {
            var isValid;
            isValid = rules.minLength.validator('01', 2, {});
            expect(isValid).toBe(true);
        });
        it('should true if property is string with more than required number of characters', function () {
            var isValid;
            isValid = rules.minLength.validator('0123456', 2, {});
            expect(isValid).toBe(true);
        });
        it('should false if property is string with too few characters', function () {
            var isValid;
            isValid = rules.minLength.validator('c', 2, {});
            expect(isValid).toBe(false);
        });
        it('should true if property is an array with required number of items', function () {
            var isValid;
            isValid = rules.minLength.validator(['0', '1'], 2, {});
            expect(isValid).toBe(true);
        });
        it('should true if property is an array with more than required number of items', function () {
            var isValid;
            isValid = rules.minLength.validator(['0', '1'], 1);
            expect(isValid).toBe(true);
        });
        it('should false if property is an array with too few items', function () {
            var isValid;
            isValid = rules.minLength.validator(['c'], 2, {});
            expect(isValid).toBe(false);
        });
        it('should false if property does not have a length', function () {
            var isValid;
            isValid = rules.minLength.validator(false, [2, 4], {});
            expect(isValid).toBe(false);
        });
    });
    describe('With an exactLength validator', function () {
        itShouldReturnTrueForEmptyValues('exactLength');
        it('should true if property is string with exact number of characters allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator('01', 2, {});
            expect(isValid).toBe(true);
        });
        it('should false if property is string with less than the exact number of characters allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator('0', 2, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is string with greater than the exact number of characters allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator('012', 2, {});
            expect(isValid).toBe(false);
        });
        it('should true if property is an array with exact number of items allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator(['0', '1'], 2, {});
            expect(isValid).toBe(true);
        });
        it('should false if property is an array with less than the exact number of items allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator(['0'], 2, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is an array with greater than the exact number of items allowed', function () {
            var isValid;
            isValid = rules.exactLength.validator(['0', '1', '2'], 2, {});
            expect(isValid).toBe(false);
        });
        it('should false if property does not have a length', function () {
            var isValid;
            isValid = rules.exactLength.validator(true, 3, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.requiredLength = 8;
                this.input = document.createElement('input');
                rules.exactLength.modifyElement(this.input, this.requiredLength);
            });
            it('should set maxLength attribute to exactLength option', function () {
                expect(this.input).toHaveAttr('maxLength', this.requiredLength.toString());
            });
        });
    });
    describe('With a maxLength validator', function () {
        itShouldReturnTrueForEmptyValues('maxLength');
        it('should true if property is string with maximum number of characters allowed', function () {
            var isValid;
            isValid = rules.maxLength.validator('01', 2, {});
            expect(isValid).toBe(true);
        });
        it('should true if property is string with less than maximum number of characters', function () {
            var isValid;
            isValid = rules.maxLength.validator('0', 2, {});
            expect(isValid).toBe(true);
        });
        it('should false if property is string with too many characters', function () {
            var isValid;
            isValid = rules.maxLength.validator('cfty', 2, {});
            expect(isValid).toBe(false);
        });
        it('should true if property is an array with maximum number of items allowed', function () {
            var isValid;
            isValid = rules.maxLength.validator(['0', '1'], 2, {});
            expect(isValid).toBe(true);
        });
        it('should true if property is an array with less than maximum number of items', function () {
            var isValid;
            isValid = rules.maxLength.validator(['0'], 2, {});
            expect(isValid).toBe(true);
        });
        it('should false if property is an array with too many items', function () {
            var isValid;
            isValid = rules.maxLength.validator(['c', 'f', 't', 'y'], 2, {});
            expect(isValid).toBe(false);
        });
        it('should false if property does not have a length', function () {
            var isValid;
            isValid = rules.maxLength.validator(false, [2, 4], {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.maxLength = 8;
                this.input = document.createElement('input');
                rules.maxLength.modifyElement(this.input, this.maxLength);
            });
            it('should set maxLength attribute to maxLength option', function () {
                expect(this.input).toHaveAttr('maxLength', this.maxLength.toString());
            });
        });
    });
    describe('With a rangeLength validator', function () {
        itShouldReturnTrueForEmptyValues('rangeLength');
        it('should true if property is string with minimum number of characters as defined by first element of options array', function () {
            var isValid;
            isValid = rules.rangeLength.validator('12', [2, 4], {});
            expect(isValid).toBe(true);
        });
        it('should true if property is string with maximum number of characters as defined by second element of options array', function () {
            var isValid;
            isValid = rules.rangeLength.validator('1234', [2, 4], {});
            expect(isValid).toBe(true);
        });
        it('should true if property is string with character count within minimum and maximum allowed', function () {
            var isValid;
            isValid = rules.rangeLength.validator('123', [2, 4], {});
            expect(isValid).toBe(true);
        });
        it('should false if property is string with too many characters', function () {
            var isValid;
            isValid = rules.rangeLength.validator('12345', [2, 4], {});
            expect(isValid).toBe(false);
        });
        it('should false if property is string with too few characters', function () {
            var isValid;
            isValid = rules.rangeLength.validator('1', [2, 4], {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a string', function () {
            var isValid;
            isValid = rules.rangeLength.validator(false, [2, 4], {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.minLength = 6;
                this.maxLength = 8;
                this.input = document.createElement('input');
                rules.rangeLength.modifyElement(this.input, [this.minLength, this.maxLength]);
            });
            it('should set maxLength attribute to maxLength option', function () {
                expect(this.input).toHaveAttr('maxLength', this.maxLength.toString());
            });
        });
    });
    describe('With a min validator', function () {
        itShouldReturnTrueForEmptyValues('min');
        it('should true if property value is equal to minimum option value', function () {
            var isValid;
            isValid = rules.min.validator(56, 56, {});
            expect(isValid).toBe(true);
        });
        it('should true if property value is greater than minimum option value', function () {
            var isValid;
            isValid = rules.min.validator(456, 56, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is less than minimum option value', function () {
            var isValid;
            isValid = rules.min.validator(4, 56, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a number', function () {
            var isValid;
            isValid = rules.min.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.minValue = 6;
                this.input = document.createElement('input');
                rules.min.modifyElement(this.input, this.minValue);
            });
            it('should set aria-valuemin attribute to minValue option', function () {
                expect(this.input).toHaveAttr('aria-valuemin', this.minValue.toString());
            });
            it('should set min attribute to minValue option', function () {
                expect(this.input).toHaveAttr('min', this.minValue.toString());
            });
        });
    });
    describe('With a moreThan validator', function () {
        itShouldReturnTrueForEmptyValues('moreThan');
        it('should false if property value is equal to minimum option value', function () {
            var isValid;
            isValid = hx.validation.rules.moreThan.validator(56, 56, {});
            expect(isValid).toBe(false);
        });
        it('should true if property value is greater than minimum option value', function () {
            var isValid;
            isValid = hx.validation.rules.moreThan.validator(456, 56, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is less than minimum option value', function () {
            var isValid;
            isValid = hx.validation.rules.moreThan.validator(4, 56, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a number', function () {
            var isValid;
            isValid = hx.validation.rules.moreThan.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a max validator', function () {
        itShouldReturnTrueForEmptyValues('max');
        it('should true if property value is equal to maximum option value', function () {
            var isValid;
            isValid = rules.max.validator(56, 56, {});
            expect(isValid).toBe(true);
        });
        it('should true if property value is less than maximum option value', function () {
            var isValid;
            isValid = rules.max.validator(34, 56, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is greater than maximum option value', function () {
            var isValid;
            isValid = rules.max.validator(346, 56, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a number', function () {
            var isValid;
            isValid = rules.max.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.maxValue = 6;
                this.input = document.createElement('input');
                rules.max.modifyElement(this.input, this.maxValue);
            });
            it('should set aria-valuemax attribute to maxValue option', function () {
                expect(this.input).toHaveAttr('aria-valuemax', this.maxValue.toString());
            });
            it('should set max attribute to maxValue option', function () {
                expect(this.input).toHaveAttr('max', this.maxValue.toString());
            });
        });
    });
    describe('With a lessThan validator', function () {
        itShouldReturnTrueForEmptyValues('lessThan');
        it('should false if property value is equal to maximum option value', function () {
            var isValid;
            isValid = hx.validation.rules.lessThan.validator(56, 56, {});
            expect(isValid).toBe(false);
        });
        it('should true if property value is less than maximum option value', function () {
            var isValid;
            isValid = hx.validation.rules.lessThan.validator(34, 56, {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is greater than maximum option value', function () {
            var isValid;
            isValid = hx.validation.rules.lessThan.validator(346, 56, {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a number', function () {
            var isValid;
            isValid = hx.validation.rules.lessThan.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a range validator', function () {
        itShouldReturnTrueForEmptyValues('range');
        it('should true if property is minimum value as defined by first element of options array', function () {
            var isValid;
            isValid = rules.range.validator(2, [2, 65], {});
            expect(isValid).toBe(true);
        });
        it('should true if property is maximum value as defined by second element of options array', function () {
            var isValid;
            isValid = rules.range.validator(65, [2, 65], {});
            expect(isValid).toBe(true);
        });
        it('should true if property is within minimum and maximum allowed', function () {
            var isValid;
            isValid = rules.range.validator(3, [2, 4], {});
            expect(isValid).toBe(true);
        });
        it('should false if property is more than maximum', function () {
            var isValid;
            isValid = rules.range.validator(5, [2, 4], {});
            expect(isValid).toBe(false);
        });
        it('should false if property is less than minimum', function () {
            var isValid;
            isValid = rules.range.validator(1, [2, 4], {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a number', function () {
            var isValid;
            isValid = rules.range.validator("Not a Number", [2, 4], {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.minValue = 6;
                this.maxValue = 6;
                this.input = document.createElement('input');
                rules.range.modifyElement(this.input, [this.minValue, this.maxValue]);
            });
            it('should set aria-valuemin attribute to minValue option', function () {
                expect(this.input).toHaveAttr('aria-valuemin', this.minValue.toString());
            });
            it('should set min attribute to minValue option', function () {
                expect(this.input).toHaveAttr('min', this.minValue.toString());
            });
            it('should set aria-valuemax attribute to maxValue option', function () {
                expect(this.input).toHaveAttr('aria-valuemax', this.maxValue.toString());
            });
            it('should set max attribute to maxValue option', function () {
                expect(this.input).toHaveAttr('max', this.maxValue.toString());
            });
        });
    });
    describe('With a min date validator', function () {
        itShouldReturnTrueForEmptyValues('minDate');
        it('should true if property value is equal to minimum date value', function () {
            var isValid;
            isValid = rules.minDate.validator(new Date(2011, 1, 1), new Date(2011, 1, 1));
            expect(isValid).toBe(true);
        });
        it('should true if property value is after than minimum date value', function () {
            var isValid;
            isValid = rules.minDate.validator(new Date(2010, 1, 1), new Date(2009, 1, 1));
            expect(isValid).toBe(true);
        });
        it('should false if property value is before than minimum option value', function () {
            var isValid;
            isValid = rules.minDate.validator(new Date(2010, 1, 1), new Date(2011, 1, 1));
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.minDate.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a max date validator', function () {
        itShouldReturnTrueForEmptyValues('maxDate');
        it('should true if property value is equal to maximum date value', function () {
            var isValid;
            isValid = rules.maxDate.validator(new Date(2011, 1, 1), new Date(2011, 1, 1));
            expect(isValid).toBe(true);
        });
        it('should true if property value is less than maximum date value', function () {
            var isValid;
            isValid = rules.maxDate.validator(new Date(2010, 1, 1), new Date(2011, 1, 1));
            expect(isValid).toBe(true);
        });
        it('should false if property value is greater than maximum option value', function () {
            var isValid;
            isValid = rules.maxDate.validator(new Date(2011, 1, 1), new Date(2010, 1, 1));
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.maxDate.validator("Not a Number", 5, {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a in the future validator', function () {
        itShouldReturnTrueForEmptyValues('inFuture');
        it('should true if property value is tomorrow', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inFuture.validator(tomorrow, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is today', function () {
            var isValid;
            isValid = rules.inFuture.validator(new Date(), "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if property value is yesterday', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inFuture.validator(yesterday, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.inFuture.validator("Not a Number", "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the future and temporal check type is DateTime', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inFuture.validator(tomorrow, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is in the past and temporal check type is DateTime', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inFuture.validator(yesterday, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is one second in the future and temporal check type is DateTime', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.inFuture.validator(future, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is one second in the past and temporal check type is DateTime', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.inFuture.validator(past, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date and temporal check type is DateTime', function () {
            var isValid;
            isValid = rules.inFuture.validator("Not a Number", "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the future and temporal check type is Date', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inFuture.validator(tomorrow, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is in the past and temporal check type is Date', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inFuture.validator(yesterday, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is one second in the future and temporal check type is Date', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.inFuture.validator(future, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is one second in the past and temporal check type is Date', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.inFuture.validator(past, "Date", {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a in the past validator', function () {
        itShouldReturnTrueForEmptyValues('inPast');
        it('should false if property value is tomorrow', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inPast.validator(tomorrow, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if property value is today', function () {
            var isValid;
            isValid = rules.inPast.validator(new Date(), "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if property value is yesterday', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inPast.validator(yesterday, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.inPast.validator("Not a Number", "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is in the future and temporal check type is DateTime', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inPast.validator(tomorrow, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the past and temporal check type is DateTime', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inPast.validator(yesterday, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is one second in the future and temporal check type is DateTime', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.inPast.validator(future, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is one second in the past and temporal check type is DateTime', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.inPast.validator(past, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if property is not a date and temporal check type is DateTime', function () {
            var isValid;
            isValid = rules.inFuture.validator("Not a Number", "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is in the future and temporal check type is Date', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.inPast.validator(tomorrow, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the past and temporal check type is Date', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.inPast.validator(yesterday, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is one second in the future and temporal check type is Date', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.inPast.validator(future, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is one second in the past and temporal check type is Date', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.inPast.validator(past, "Date", {});
            expect(isValid).toBe(false);
        });
    });
    describe('With a not in the past validator', function () {
        itShouldReturnTrueForEmptyValues('notInPast');
        it('should true if property value is tomorrow', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInPast.validator(tomorrow, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should true if property value is today', function () {
            var isValid;
            isValid = rules.notInPast.validator(new Date(), "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if property value is yesterday', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInPast.validator(yesterday, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.notInPast.validator("Not a Number", "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the future and temporal check type is DateTime', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInPast.validator(tomorrow, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is in the past and temporal check type is DateTime', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInPast.validator(yesterday, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is one second in the future and temporal check type is DateTime', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.notInPast.validator(future, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is one second in the past and temporal check type is DateTime', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.notInPast.validator(past, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should false if property is not a date and temporal check type is DateTime', function () {
            var isValid;
            isValid = rules.notInPast.validator("Not a Number", "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the future and temporal check type is Date', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInPast.validator(tomorrow, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is in the past and temporal check type is Date', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInPast.validator(yesterday, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is one second in the future and temporal check type is Date', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.notInPast.validator(future, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should true if date is one second in the past and temporal check type is Date', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.notInPast.validator(past, "Date", {});
            expect(isValid).toBe(true);
        });
    });
    describe('With a not in future validator', function () {
        itShouldReturnTrueForEmptyValues('notInFuture');
        it('should false if property value is tomorrow', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInFuture.validator(tomorrow, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if property value is today', function () {
            var isValid;
            isValid = rules.notInFuture.validator(new Date(), "Date", {});
            expect(isValid).toBe(true);
        });
        it('should true if property value is yesterday', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInFuture.validator(yesterday, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should false if property is not a date', function () {
            var isValid;
            isValid = rules.notInFuture.validator("Not a Number", "Date", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is in the future and temporal check type is DateTime', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInFuture.validator(tomorrow, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the past and temporal check type is DateTime', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInFuture.validator(yesterday, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if date is one second in the future and temporal check type is DateTime', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.notInFuture.validator(future, "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is one second in the past and temporal check type is DateTime', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.notInFuture.validator(past, "DateTime", {});
            expect(isValid).toBe(true);
        });
        it('should false if property is not a date and temporal check type is DateTime', function () {
            var isValid;
            isValid = rules.notInFuture.validator("Not a Number", "DateTime", {});
            expect(isValid).toBe(false);
        });
        it('should false if date is in the future and temporal check type is Date', function () {
            var isValid, tomorrow;
            tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            isValid = rules.notInFuture.validator(tomorrow, "Date", {});
            expect(isValid).toBe(false);
        });
        it('should true if date is in the past and temporal check type is Date', function () {
            var isValid, yesterday;
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            isValid = rules.notInFuture.validator(yesterday, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should true if date is one second in the future and temporal check type is Date', function () {
            var future, isValid;
            future = new Date();
            future.setSeconds(future.getSeconds() + 1);
            isValid = rules.notInFuture.validator(future, "Date", {});
            expect(isValid).toBe(true);
        });
        it('should true if date is one second in the past and temporal check type is Date', function () {
            var isValid, past;
            past = new Date();
            past.setSeconds(past.getSeconds() - 1);
            isValid = rules.notInFuture.validator(past, "Date", {});
            expect(isValid).toBe(true);
        });
    });
    describe('with an numeric validator', function () {
        itShouldReturnTrueForEmptyValues('numeric');
        it('should true if value is an integer', function () {
            var isValid, value;
            value = '12';
            isValid = rules.numeric.validator(value, true, {});
            expect(isValid).toBe(true);
        });
        it('should true if value is a double', function () {
            var isValid, value;
            value = '1.2';
            isValid = rules.numeric.validator(value, true, {});
            expect(isValid).toBe(true);
        });
        it('should false if value is not numeric', function () {
            var isValid, value;
            value = 'numeric';
            isValid = rules.numeric.validator(value, true, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.input = document.createElement('input');
                rules.numeric.modifyElement(this.input, true);
            });
            it('should set type attribute to numeric', function () {
                expect(this.input).toHaveAttr('type', 'numeric');
            });
        });
    });
    describe('with an integer validator', function () {
        itShouldReturnTrueForEmptyValues('integer');
        it('should true if value is an integer', function () {
            var isValid, value;
            value = '12';
            isValid = hx.validation.rules.integer.validator(value, true, {});
            expect(isValid).toBe(true);
        });
        it('should false if value is a double', function () {
            var isValid, value;
            value = '1.2';
            isValid = hx.validation.rules.integer.validator(value, true, {});
            expect(isValid).toBe(false);
        });
        it('should false if value is not an integer', function () {
            var isValid, value;
            value = 'numeric';
            isValid = hx.validation.rules.integer.validator(value, true, {});
            expect(isValid).toBe(false);
        });
        describe('with a modified input element', function () {
            beforeEach(function () {
                this.input = document.createElement('input');
                rules.integer.modifyElement(this.input, true);
            });
            it('should set type attribute to numeric', function () {
                expect(this.input).toHaveAttr('type', 'numeric');
            });
        });
    });
    describe('with a requiredIf validator', function () {
        it('should true if value does not trigger required validation and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['triggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value does not trigger required validation and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['triggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value triggers required validation and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['triggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['triggering']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should true if value triggers required validation from a list of possible options and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['triggering', 'trigger', 'anotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation from a list of possible options and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['triggering', 'trigger', 'anotherTrigger']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should true if value does not triggers required validation from a list of possible options and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['triggering', 'trigger', 'anotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value does not trigger required validation from a list of possible options and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['triggering', 'trigger', 'anotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value triggers required validation when trigger is empty and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable(''),
                equalsOneOf: ['']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation when trigger is empty and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIf.validator(value, {
                value: ko.observable(''),
                equalsOneOf: ['']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should throw an error if a property or value field is not provided', function () {
            var func, model;
            model = {
                conditionallyRequiredProperty: 'not empty'
            };
            func = function () {
                hx.validation.rules.requiredIf.validator(model.conditionallyRequiredProperty, {
                    equalsOneOf: ['']
                }, model);
            };
            expect(func).toThrow('You need to provide a value.');
        });
        it('should throw an error if no values are provided to compare with', function () {
            var func, model;
            model = {
                conditionallyRequiredProperty: 'not empty',
                propertyToCheckAgainst: 'a value'
            };
            func = function () {
                hx.validation.rules.requiredIf.validator(model.conditionallyRequiredProperty, {
                    property: 'propertyToCheckAgainst'
                }, model);
            };
            expect(func).toThrow('You need to provide a list of items to check against.');
        });
    });
    describe('with an equalTo validator', function () {
        itShouldReturnTrueForEmptyValues('equalTo');
        it('should true if value is equal', function () {
            var isValid, options, value;
            value = '12';
            options = '12';
            isValid = hx.validation.rules.equalTo.validator(value, options);
            expect(isValid).toBe(true);
        });
        it('should unwrap an observable model value', function () {
            var isValid, options, value;
            value = '12';
            options = ko.observable(value);
            isValid = hx.validation.rules.equalTo.validator(value, options);
            expect(isValid).toBe(true);
        });
        it('should false if value is not equal', function () {
            var isValid, options, value;
            value = '1.2';
            options = '12';
            isValid = hx.validation.rules.equalTo.validator(value, options);
            expect(isValid).toBe(false);
        });
    });
    describe('with a requiredIfNot validator', function () {
        it('should true if value does not trigger required validation and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['notTriggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value does not trigger required validation and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['notTriggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value triggers required validation and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['notTriggering']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['notTriggering']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should true if value triggers required validation from a list of possible options and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['notTriggering', 'notTrigger', 'notAnotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation from a list of possible options and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('triggering'),
                equalsOneOf: ['notTriggering', 'notTrigger', 'notAnotherTrigger']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should true if value does not triggers required validation from a list of possible options and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['notTriggering', 'notTrigger', 'notAnotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value does not trigger required validation from a list of possible options and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('notTriggering'),
                equalsOneOf: ['notTriggering', 'notTrigger', 'notAnotherTrigger']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should true if value triggers required validation when trigger is empty and value is not empty', function () {
            var isValid, value;
            value = 'not empty';
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('trigger'),
                equalsOneOf: ['']
            }, {});
            expect(isValid).toBe(true);
        });
        it('should false if value triggers required validation when trigger is empty and value is empty', function () {
            var isValid, value;
            value = void 0;
            isValid = hx.validation.rules.requiredIfNot.validator(value, {
                value: ko.observable('trigger'),
                equalsOneOf: ['']
            }, {});
            expect(isValid).toBe(false);
        });
        it('should throw an error if a property or value field is not provided', function () {
            var func, model;
            model = {
                conditionallyRequiredProperty: 'not empty'
            };
            func = function () {
                hx.validation.rules.requiredIfNot.validator(model.conditionallyRequiredProperty, {
                    equalsOneOf: ['']
                }, model);
            };
            expect(func).toThrow('You need to provide a value.');
        });
    });
    describe('with a custom validator', function () {
        it('should throw an error if the options parameter is undefined', function () {
            var func;
            func = function () {
                hx.validation.rules.custom.validator('a value', void 0, {});
            };
            expect(func).toThrow("Must pass a function to the 'custom' validator");
        });
        it('should throw an error if the options parameter is not a function', function () {
            var func;
            func = function () {
                hx.validation.rules.custom.validator('a value', 'not a function', {});
            };
            expect(func).toThrow("Must pass a function to the 'custom' validator");
        });
        it('should true if validation function returns true', function () {
            var isValid, validationFunction;
            validationFunction = function () {
                return true;
            };
            isValid = hx.validation.rules.custom.validator('a value', validationFunction, {});
            expect(isValid).toBe(true);
        });
        it('should false if validation function returns false', function () {
            var isValid, validationFunction;
            validationFunction = function () {
                return false;
            };
            isValid = hx.validation.rules.custom.validator('a value', validationFunction, {});
            expect(isValid).toBe(false);
        });
        it('should call custom validator with value parameter', function () {
            var validationFunction, value;
            validationFunction = this.spy();
            value = 'A Value';
            hx.validation.rules.custom.validator(value, validationFunction);
            expect(validationFunction).toHaveBeenCalledWith(value);
        });
    });
});