describe('utils', function () {
    describe('When converting to title case', function () {
        it('should handle non-string values by calling toString', function () {
            expect(hx.utils.toTitleCase(void 0)).toBeUndefined();
        });

        it('should uppercase the first character of subsequent words in the string', function () {
            expect(hx.utils.toTitleCase('myElephant')).toEqual('My Elephant');
        });

        it('should handle long strings', function () {
            expect(hx.utils.toTitleCase('thisIsMyVeryLargeVIPElephant')).toEqual('This Is My Very Large VIP Elephant');
        });

        it('should keep acronyms upper cased', function () {
            expect(hx.utils.toTitleCase('myVIPElephant')).toEqual('My VIP Elephant');
        });

        it('should split numbers from words', function () {
            expect(hx.utils.toTitleCase('AddressLine1')).toEqual('Address Line 1');
        });

        it('should handle multiple acronyms', function () {
            expect(hx.utils.toTitleCase('My PIN Number hasLeakedOMG')).toEqual('My PIN Number Has Leaked OMG');
        });

        it('should convert words as part of a larger sentence', function () {
            expect(hx.utils.toTitleCase('This is MY VeryLargeVIPElephant')).toEqual('This Is MY Very Large VIP Elephant');
        });
    });

    describe('When converting to camel case', function () {
        it('should handle non-string values by calling toString', function () {
            expect(hx.utils.toCamelCase(void 0, false)).toBeUndefined();
        });

        it('should uppercase the first character of subsequent words in the string', function () {
            expect(hx.utils.toCamelCase('myElephant', false)).toEqual('myElephant');
        });

        it('should handle long strings', function () {
            expect(hx.utils.toCamelCase('ThisIsMyVeryLargeVIPElephant', false)).toEqual('thisIsMyVeryLargeVIPElephant');
        });

        it('should keep acronyms upper cased', function () {
            expect(hx.utils.toCamelCase('MyVIPElephant', false)).toEqual('myVIPElephant');
        });

        it('should split numbers from words', function () {
            expect(hx.utils.toCamelCase('AddressLine1', false)).toEqual('addressLine1');
        });

        it('should handle multiple acronyms', function () {
            expect(hx.utils.toCamelCase('My PIN Number hasLeakedOMG', false)).toEqual('my PIN Number HasLeakedOMG');
        });

        it('should convert words as part of a larger sentence', function () {
            expect(hx.utils.toCamelCase('This is MY VeryLargeVIPElephant', false)).toEqual('this Is MY VeryLargeVIPElephant');
        });
    });

    describe('When converting to sentence case', function () {
        it('should return undefined for an undefined value being passed', function () {
            expect(hx.utils.toSentenceCase(void 0)).toBeUndefined();
        });

        it('should handle non-string values by calling toString', function () {
            expect(hx.utils.toSentenceCase(true)).toEqual('True');
        });

        it('should uppercase the first character of the passed in string', function () {
            expect(hx.utils.toSentenceCase('MyElephant')).toEqual('My elephant');
        });

        it('should lowercase the first character of subsequent words in the string', function () {
            expect(hx.utils.toSentenceCase('myElephant')).toEqual('My elephant');
        });

        it('should handle long strings', function () {
            expect(hx.utils.toSentenceCase('thisIsMyVeryLargeVIPElephant')).toEqual('This is my very large VIP elephant');
        });

        it('should keep acronyms upper cased', function () {
            expect(hx.utils.toSentenceCase('myVIPElephant')).toEqual('My VIP elephant');
        });

        it('should handle multiple acronyms', function () {
            expect(hx.utils.toSentenceCase('My PIN Number hasLeakedOMG')).toEqual('My PIN number has leaked OMG');
        });

        it('should split numbers from words', function () {
            expect(hx.utils.toSentenceCase('AddressLine1')).toEqual('Address line 1');
        });

        it('should convert words as part of a larger sentence', function () {
            expect(hx.utils.toSentenceCase('This is MY VeryLargeVIPElephant')).toEqual('This is MY very large VIP elephant');
        });
    });

    describe('When converting to css class', function () {
        it('should handle non-string values by calling toString', function () {
            expect(hx.utils.toCssClass(void 0)).toBe('');
        });

        it('should lowercase the first character of subsequent words in the string, separated by dash', function () {
            expect(hx.utils.toCssClass('myElephant')).toEqual('my-elephant');
        });

        it('should handle long strings', function () {
            expect(hx.utils.toCssClass('thisIsMyVeryLargeVIPElephant')).toEqual('this-is-my-very-large-vip-elephant');
        });

        it('should split numbers from words', function () {
            expect(hx.utils.toCssClass('AddressLine1')).toEqual('address-line-1');
        });

        it('should convert words as part of a larger sentence', function () {
            expect(hx.utils.toCssClass('This is MY VeryLargeElephant')).toEqual('this-is-my-very-large-elephant');
        });
    });


    describe('When converting to an observable', function () {
        it('should return an observable array if it is an array', function () {
            var converted, rawValue;
            rawValue = ['a', 'b', 'c'];
            converted = hx.utils.asObservable(rawValue);
            expect(converted).toBeAnObservableArray();
            expect(converted()).toEqual(rawValue);
        });

        it('should return an computed if it is a function', function () {
            var converted, rawValue;
            rawValue = function () { return "hello"; };
            converted = hx.utils.asObservable(rawValue);
            expect(converted).toBeObservable();
            expect(converted()).toEqual("hello");
        });
        
        it('should return an observable if it is not an array', function () {
            var converted, rawValue;
            rawValue = 'a';
            converted = hx.utils.asObservable(rawValue);
            expect(converted).toBeObservable();
            expect(converted()).toEqual(rawValue);
        });

        it('should return an observable if it is undefined', function () {
            var converted, rawValue;
            rawValue = null;
            converted = hx.utils.asObservable(rawValue);
            expect(converted).toBeObservable();
            expect(converted()).toEqual(rawValue);
        });

        it('should return the same observable if it is an observable', function () {
            var converted, rawValue;
            rawValue = ko.observable('a');
            converted = hx.utils.asObservable(rawValue);
            expect(converted).toBeObservable();
            expect(converted).toEqual(rawValue);
        });

        it('should use context if given a function', function () {
            var context = { prop: 'value' },
                recordedContext,
                rawValue = function () { recordedContext = this; return "hello"; },
                converted = hx.utils.asObservable(rawValue, context);

            expect(converted).toBeObservable();
            expect(converted()).toEqual("hello");
            expect(recordedContext).toBe(context);
        });
    });
});