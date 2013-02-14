function createStorageSpecs(type) {
    return function() {
        var storage = window[type + 'Storage'];

        describe('with no items', function () {
            it('should have a length of 0', function () {
                expect(storage.length).toEqual(0);
            });
        });

        describe('with single, simple, item added', function () {
            beforeEach(function () {
                storage.setItem('myKey', 'myValue');
            });

            it('should have a length of 1', function () {
                expect(storage.length).toEqual(1);
            });

            it('should allow getting the item', function () {
                expect(storage.getItem('myKey')).toEqual('myValue');
            });

            it('should allow clearing the storage', function () {
                storage.clear();
                expect(storage.getItem('myKey')).toBe(null);
            });
        });

        describe('with single, complex, item added', function () {
            beforeEach(function () {
                storage.setItem('myKey', JSON.stringify({
                    aProperty: 'myValue'
                }));
            });

            it('should have a length of 1', function () {
                expect(storage.length).toEqual(1);
            });

            it('should allow getting the item', function () {
                expect(storage.getItem('myKey')).toEqual(JSON.stringify({
                    aProperty: 'myValue'
                }));
            });

            it('should allow clearing the storage', function () {
                storage.clear();
                expect(storage.getItem('myKey')).toBe(null);
            });
        });

        describe('with extender for simple property', function () {
            var extensions = {};
            extensions[type + 'Storage'] = 'myKey';

            describe('with no existing data in storage', function () {
                beforeEach(function () {
                    this.observable = ko.observable('myValue').extend(extensions);
                });

                it('should not override the existing value on creation', function () {
                    expect(this.observable()).toEqual('myValue');
                });

                it('should store the value in storage when observable changes', function () {
                    var newObservable;
                    this.observable(123456);
                    newObservable = ko.observable().extend(extensions);
                    expect(newObservable()).toEqual(123456);
                });
            });

            describe('with empty string (crashes IE8 storing empty string in storage)', function () {
                beforeEach(function () {
                    this.observable = ko.observable('').extend(extensions);
                });

                it('should not override the existing value on creation', function () {
                    expect(this.observable()).toEqual('');
                });
            });

            describe('with existing data in storage', function () {
                beforeEach(function () {
                    var existing;
                    existing = ko.observable().extend(extensions);
                    existing('myValue');
                    this.observable = ko.observable('a value to override').extend(extensions);
                });

                it('should override the existing value on creation', function () {
                    expect(this.observable()).toEqual('myValue');
                });

                it('should store the value in storage when observable changes', function () {
                    var newObservable;
                    this.observable('myNewValue');
                    newObservable = ko.observable().extend(extensions);
                    expect(newObservable()).toEqual('myNewValue');
                });
            });
        });

        describe('with extender for complex property', function () {
            var extensions = {};
            extensions[type + 'Storage'] = 'myKey';

            describe('with no existing data in storage', function () {
                beforeEach(function () {
                    this.observable = ko.observable({
                        aProperty: 'myValue'
                    }).extend(extensions);
                });

                it('should not override the existing value on creation', function () {
                    expect(this.observable()).toEqual({
                        aProperty: 'myValue'
                    });
                });

                it('should store the value in storage when observable changes', function () {
                    var newObservable;
                    this.observable({
                        aProperty: 'anotherValue'
                    });
                    newObservable = ko.observable().extend(extensions);
                    expect(newObservable()).toEqual({
                        aProperty: 'anotherValue'
                    });
                });
            });

            describe('with existing data in storage', function () {
                beforeEach(function () {
                    var existing = ko.observable().extend(extensions);

                    existing({
                        aProperty: 'myValue'
                    });

                    this.observable = ko.observable({
                        aProperty: 'a value to override'
                    }).extend(extensions);
                });

                it('should override the existing value on creation', function () {
                    expect(this.observable()).toEqual({
                        aProperty: 'myValue'
                    });                
                });

                it('should store the value in storage when observable changes', function () {
                    var newObservable;
                    this.observable({
                        aProperty: 'anotherValue'
                    });
                    
                    newObservable = ko.observable().extend(extensions);

                    expect(newObservable()).toEqual({
                        aProperty: 'anotherValue'
                    });
                });
            });
        });
    }
};

describe('Storage', function () {
    describe('localStorage', createStorageSpecs('local'));
    describe('sessionStorage', createStorageSpecs('session'));
});