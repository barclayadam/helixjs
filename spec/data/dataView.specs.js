describe('dataView', function() {
    var $DataView = hx.get('$DataView');

    describe('newly created with no options specified', function() {   
        beforeEach(function() {
            this.dataView = $DataView.from(this.stub());
        })

        it('should return the dataView from load function', function() {
            expect(this.dataView.load()).toBe(this.dataView);
        })

        it('should have a data observable that is undefined', function() {
            expect(this.dataView.data).toBeObservable();
            expect(this.dataView.data()).toBeUndefined();
        })

        it('should have a totalCount observable that is undefined', function() {
            expect(this.dataView.totalCount).toBeObservable();
            expect(this.dataView.totalCount()).toBeUndefined();
        })

        it('should have a pageCount observable that is undefined', function() {
            expect(this.dataView.pageCount).toBeObservable();
            expect(this.dataView.pageCount()).toBeUndefined();
        })
    });

    it('should default to in memory provider if passed an observable', function() {
        var $InMemoryProvider = hx.get('$InMemoryProvider'),
            dataView = $DataView.from(ko.observable(['A Value']));

        expect(dataView.$$provider instanceof $InMemoryProvider).toBe(true);
    })

    it('should default to in memory provider if passed an array', function() {
        var $InMemoryProvider = hx.get('$InMemoryProvider'),
            dataView = $DataView.from(['A Value']);

        expect(dataView.$$provider instanceof $InMemoryProvider).toBe(true);
    })

    describe('all options with static values defined, function as a provider', function() {    
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34]
            this.providerStub = this.stub().returns(this.returnValue);

            this.whereFn = function() { return true; };
            this.mapFn = function(i) { return i; };

            this.dataView = $DataView
                                .from(this.providerStub)
                                .params({ aParam: 1 })
                                .where(this.whereFn)
                                .orderBy('aProperty asc')
                                .groupBy('aProperty')
                                .take(15)
                                .skip(10)
                                .map(this.mapFn);
        })

        it('should not immediately call the provider', function() {
            expect(this.providerStub).toHaveNotBeenCalled();
        })

        it('should have an empty data observable', function() {
            expect(this.dataView.data).toBeObservable();
            expect(this.dataView.data()).toBeUndefined();
        })

        describe('when calling load', function() {  
            beforeEach(function() {
                this.dataView.load();
            });

            it('should call provider with all options given', function() {
                expect(this.providerStub).toHaveBeenCalledWith({
                    params: { aParam: 1 },
                    orderBy: 'aProperty asc',
                    groupBy: 'aProperty',
                    where: this.whereFn,
                    take: 15,
                    skip: 10,
                    map: this.mapFn
                })
            })

            it('should store return value as a data observable', function() {
                expect(this.dataView.data()).toEqual(this.returnValue);
            })
        })
    })

    describe('getting specified options', function() { 
       var options = {
            params: { aParam: 1 },
            where: function() { },
            orderBy: 'aProperty asc',
            groupBy: 'aProperty',
            take: 15,
            skip: 10,
            map:  function() { }
        }

        beforeEach(function() {
            this.dataView = $DataView.from(this.stub());

            for(var key in options) {
                this.dataView[key](options[key]);
            }
        })

        for(var key in options) {
            (function capture() {
                var optionKey = key;
                it('should be possible to get ' + optionKey + ' option', function() {
                    expect(this.dataView[optionKey]()).toBe(options[optionKey]);  
                })
            })();
        }
    });

    describe('all options with observables values defined, function as a provider', function() {    
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34]
            this.providerStub = this.stub().returns(this.returnValue);

            this.paramsObservable = ko.observable({ aParam: 1 });

            this.dataView = $DataView
                                .from(this.providerStub)
                                .params(this.paramsObservable)
                                .orderBy(ko.observable('aProperty asc'))
                                .groupBy(ko.observable('aProperty'))
                                .take(ko.observable(15))
                                .skip(ko.observable(10));
        })

        it('should not immediately call the provider', function() {
            expect(this.providerStub).toHaveNotBeenCalled();
        })

        it('should have an empty data observable', function() {
            expect(this.dataView.data).toBeObservable();
            expect(this.dataView.data()).toBeUndefined();
        })

        it('should not call provider after a change to observable properties', function() {
            this.paramsObservable({ anotherParam: 3 });

            expect(this.providerStub).toHaveNotBeenCalled();
        })

        describe('when calling load', function() {  
            beforeEach(function() {
                this.dataView.load();
            });

            it('should call provider with all options given, unwrapped', function() {
                expect(this.providerStub).toHaveBeenCalledWith({
                    params: { aParam: 1 },
                    orderBy: 'aProperty asc',
                    groupBy: 'aProperty',
                    take: 15,
                    skip: 10
                })
            })

            it('should store return value as a data observable', function() {
                expect(this.dataView.data()).toEqual(this.returnValue);
            })

            it('should call provider after a change to observable properties', function() {          
                runs(function() {
                    this.paramsObservable({ anotherParam: 3 });
                })

                // Changes are throttled
                waits(25);

                runs(function() {
                    expect(this.providerStub).toHaveBeenCalledWith({
                        params: { anotherParam: 3 },
                        orderBy: 'aProperty asc',
                        groupBy: 'aProperty',
                        take: 15,
                        skip: 10
                    })
                });
            })
        })
    })

    describe('some options with static values defined, function as a provider', function() {   
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34]
            this.providerStub = this.stub().returns(this.returnValue);

            this.dataView = $DataView
                                .from(this.providerStub)
                                .params({ aParam: 1 })
                                .take(15)
                                .skip(10);

            this.dataView.load();
        })

        it('should call provider with specified options given, others not specified', function() {
            expect(this.providerStub).toHaveBeenCalledWith({
                params: { aParam: 1 },
                take: 15,
                skip: 10
            })
        })
    });

    describe('with paging specified', function() {
        beforeEach(function() {
            this.returnValue = { totalCount: 25, items: _.range(0, 25) };
            this.providerStub = this.stub().returns(this.returnValue);

            this.dataView = $DataView
                                .from(this.providerStub)
                                .pageSize(5)
                                .page(1);

            this.dataView.load();
        })

        it('should default page to 1', function() {
            var dataView = $DataView.from(this.providerStub).pageSize(20);
            expect(dataView.page()).toBe(1);
        })

        it('should store totalCount in totalCount observable', function() {
            expect(this.dataView.totalCount()).toBe(25);
        })

        it('should store page items in data observable', function() {
            expect(this.dataView.data()).toBe(this.returnValue.items);            
        })

        it('should pass through pageSize and page parameters to provider', function() {
            expect(this.providerStub).toHaveBeenCalledWith({
                pageSize: 5,
                page: 1
            })            
        })

        it('should calculate page count and store in pageCount observable', function() {
            expect(this.dataView.pageCount).toBeObservable();            
            expect(this.dataView.pageCount()).toBe(5);
        })

        it('should re-page when page number is set', function() {
            runs(function() {
                this.dataView.page(3);
            })

            // Changes are throttled
            waits(25);

            runs(function() {
                expect(this.providerStub).toHaveBeenCalledWith({
                    pageSize: 5,
                    page: 3
                })   
            });         
        })
    })

    describe('with paging specified - no data', function() {
        beforeEach(function() {
            this.returnValue = { totalCount: 0, items: [] };
            this.providerStub = this.stub().returns(this.returnValue);

            this.dataView = $DataView
                                .from(this.providerStub)
                                .pageSize(20)
                                .page(1);

            this.dataView.load();
        })

        it('should store totalCount in totalCount observable', function() {
            expect(this.dataView.totalCount()).toBe(0);
        })

        it('should store page items in data observable', function() {
            expect(this.dataView.data()).toBe(this.returnValue.items);            
        })
    })

    describe('with a provider instance', function() {    
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34]
            this.providerStub = this.stub().returns(this.returnValue);

            this.provider = {
                load: this.providerStub
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .params({ aParam: 1 })
                                .take(15)
                                .skip(10);

            this.dataView.load();
        })

        it('should call provider instance load function when loading', function() {
            expect(this.providerStub).toHaveBeenCalledWith({
                params: { aParam: 1 },
                take: 15,
                skip: 10
            })
        })
    })

    describe('with a provider that has an initialise function', function() {   
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34];
            this.dataViewInInitialise = undefined;
            this.initialiseCount = 0;

            this.provider = {
                initialise: this.spy(),

                load: this.stub().returns(this.returnValue)
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .params({ aParam: 1 })
                                .take(15)
                                .skip(10);

            this.dataView.load();
            this.dataView.load();
        });

        it('should call initialise with dataSource argument', function() {
            expect(this.provider.initialise).toHaveBeenCalledWith(this.dataView);
        })

        it('should call initialise only once when load is called multiple times', function() {
            expect(this.provider.initialise).toHaveBeenCalledOnce();
        })
    })

    describe('with a provider that has a normaliseResult function', function() {    
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34];
            this.normalisedReturnValue = { totalCount: 51, items: ['ds', 34] };

            this.provider = {
                load: this.stub().returns(this.returnValue),

                processResult: this.stub().returns(this.normalisedReturnValue)
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .take(15)
                                .skip(10);

            this.dataView.load();
        }); 

        it('should call normaliseResult with result from load, and loadOptions', function() {
            expect(this.provider.processResult).toHaveBeenCalledWith(this.returnValue, {
                take: 15,
                skip: 10
            });
        })

        it('should use return from normaliseResult', function() {
            expect(this.dataView.data()).toBe(this.normalisedReturnValue.items);
            expect(this.dataView.totalCount()).toBe(this.normalisedReturnValue.totalCount);
        })
    });

    describe('with a provider that has a normaliseResult function and returns undefined', function() {    
        beforeEach(function() {
            this.provider = {
                load: this.stub(),

                processResult: this.stub().returns(this.normalisedReturnValue)
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .load();
        }); 

        it('should not call normaliseResult with result from load, and loadOptions', function() {
            expect(this.provider.processResult).toHaveNotBeenCalled()
        })
    });

    describe('with a provider that returns a promise', function() {    
        beforeEach(function() {
            this.returnValue = ['a', 42, 5, 3, 'ds', 34];
            this.providerReturnPromise = $.Deferred();
            this.providerStub = this.stub().returns(this.providerReturnPromise);

            this.provider = {
                load: this.providerStub
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .params({ aParam: 1 })
                                .take(15)
                                .skip(10);

            this.dataView.load();
        })

        it('should not data to the returned promise', function() {
            expect(this.dataView.data()).toBeUndefined()
        })

        it('should set data to the value of the resolved promise', function(){
            this.providerReturnPromise.resolve(this.returnValue);
            expect(this.dataView.data()).toBe(this.returnValue);
        })
    });

    describe('with a provider that provides additional methods (object defined on fn)', function() {    
        beforeEach(function() {
            this.calledWith = calledWith = {};

            this.provider = {
                load: this.stub(),

                fn: {
                    odataServiceName: this.spy(function(dataSource, parameterStore, name) {
                        calledWith.dataSource = dataSource;
                        calledWith.name = name;

                        parameterStore.odataServiceName = name;
                    })
                }
            }

            this.dataView = $DataView
                                .from(this.provider)
                                .odataServiceName('myServiceName')
                                .take(15)
                                .skip(10);

            this.dataView.load();
        })

        it('should pass through dataSource, parameter store and any arguments client passes', function() {
            expect(this.provider.fn.odataServiceName).toHaveBeenCalled();

            expect(this.calledWith.dataSource).toBe(this.dataView);
            expect(this.calledWith.name).toBe('myServiceName');
        })

        it('should pass through any parameter stored as part of function when loading', function(){
            expect(this.provider.load).toHaveBeenCalledWith({
                odataServiceName: 'myServiceName',
                take: 15,
                skip: 10
            });
        })
    });
})