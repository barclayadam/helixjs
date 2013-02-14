describe('DataSource', function () {
    describe('When a data source is created', function () {
        beforeEach(function () {
            this.loader = this.spy();
            
            this.dataSource = new hx.DataSource({
                provider: this.loader
            });
        });
        it('should have a pageSize observable property that is false', function () {
            expect(this.dataSource.isLoading).toBeObservable();
            expect(this.dataSource.isLoading()).toBe(false);
        });

        it('should have a pageSize observable property', function () {
            expect(this.dataSource.pageSize).toBeObservable();
        });

        it('should have a pageNumber observable property', function () {
            expect(this.dataSource.pageNumber).toBeObservable();
        });

        it('should have a totalCount observable property', function () {
            expect(this.dataSource.totalCount).toBeObservable();
        });

        it('should have a pageCount observable property', function () {
            expect(this.dataSource.pageCount).toBeObservable();
        });

        it('should have a items observable array property that is empty', function () {
            expect(this.dataSource.items).toBeAnObservableArray();
            expect(this.dataSource.items()).toBeAnEmptyArray();
        });

        it('should have a pageItems observable array property that is empty', function () {
            expect(this.dataSource.pageItems).toBeAnObservableArray();
            expect(this.dataSource.pageItems()).toBeAnEmptyArray();
        });

        it('should not call the loader on construction', function () {
            expect(this.loader).toHaveNotBeenCalled();
        });
    });

    describe('When a data source is loaded, with no paging', function () {
        beforeEach(function () {
            var _this = this;
            this.isLoadingDuringProvider = null;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];
            this.loader = this.spy(function (o, callback, dataSource) {
                _this.isLoadingDuringProvider = dataSource.isLoading();
                callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader
            });

            this.dataSource.load();
        });
        it('should have a pagingEnabled property set to false', function () {
            expect(this.dataSource.pagingEnabled).toEqual(false);
        });

        it('should call the loader with an empty object as first parameter', function () {
            expect(this.loader).toHaveBeenCalledWith({});
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual(this.dataToReturn);
        });

        it('should set the pageItems observable to the value passed back from the loader', function () {
            expect(this.dataSource.pageItems()).toEqual(this.dataToReturn);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 1', function () {
            expect(this.dataSource.pageCount()).toEqual(1);
        });

        it('should set the totalCount observable to the length of the loaded data', function () {
            expect(this.dataSource.totalCount()).toEqual(this.dataToReturn.length);
        });

        it('should set the pageSize observable to the length of the loaded data', function () {
            expect(this.dataSource.pageSize()).toEqual(this.dataToReturn.length);
        });

        it('should set isLoading to true during the provider callback', function () {
            expect(this.isLoadingDuringProvider).toEqual(true);
        });
        
        it('should set isLoading to false once data has been loaded', function () {
            expect(this.dataSource.isLoading()).toEqual(false);
        });
    });
    describe('When a data source is auto loaded', function () {
        beforeEach(function () {
            var _this = this;
            this.isLoadingDuringProvider = null;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];
            this.loader = this.spy(function (o, callback, dataSource) {
                _this.isLoadingDuringProvider = dataSource.isLoading();
                callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                autoLoad: true
            });
        });

        it('should have a pagingEnabled property set to false', function () {
            expect(this.dataSource.pagingEnabled).toEqual(false);
        });

        it('should call the loader with an empty object as first parameter', function () {
            expect(this.loader).toHaveBeenCalledWith({});
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual(this.dataToReturn);
        });

        it('should set the pageItems observable to the value passed back from the loader', function () {
            expect(this.dataSource.pageItems()).toEqual(this.dataToReturn);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 1', function () {
            expect(this.dataSource.pageCount()).toEqual(1);
        });

        it('should set the totalCount observable to the length of the loaded data', function () {
            expect(this.dataSource.totalCount()).toEqual(this.dataToReturn.length);
        });

        it('should set the pageSize observable to the length of the loaded data', function () {
            expect(this.dataSource.pageSize()).toEqual(this.dataToReturn.length);
        });

        it('should set isLoading to true during the provider callback', function () {
            expect(this.isLoadingDuringProvider).toEqual(true);
        });

        it('should set isLoading to false once data has been loaded', function () {
            expect(this.dataSource.isLoading()).toEqual(false);
        });
    });
    describe('When a data source is loaded, with no data', function () {
        beforeEach(function () {
            this.loadedData = [];
            
            this.dataSource = new hx.DataSource({
                provider: this.loadedData
            });
        });

        it('should set pageCount to 0', function () {
            expect(this.dataSource.pageCount()).toBe(0);
        });

        it('should set totalCount to 0', function () {
            expect(this.dataSource.totalCount()).toBe(0);
        });

        it('should set isFirstPage to true', function () {
            expect(this.dataSource.isFirstPage()).toEqual(true);
        });

        it('should set isLastPage to true', function () {
            expect(this.dataSource.isLastPage()).toEqual(true);
        });

        it('should set pageItems to empty array', function () {
            expect(this.dataSource.pageItems()).toEqual([]);
        });
    });

    describe('When a data source is loaded, with array provider', function () {
        beforeEach(function () {
            this.loadedData = [1, 4, 7, 8, 9, 13];
            return this.dataSource = new hx.DataSource({
                provider: this.loadedData
            });
        });
        it('should set the items observable to be the data supplied', function () {
            expect(this.dataSource.items()).toEqual(this.loadedData);
        });

        it('should not throw exception when calling load', function () {
            this.dataSource.load();
        });

        it('should set the pageItems observable to the data supplied', function () {
            expect(this.dataSource.pageItems()).toEqual(this.loadedData);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 1', function () {
            expect(this.dataSource.pageCount()).toEqual(1);
        });

        it('should set the totalCount observable to the length of the loaded data', function () {
            expect(this.dataSource.totalCount()).toEqual(this.loadedData.length);
        });

        it('should set the pageSize observable to the length of the loaded data', function () {
            expect(this.dataSource.pageSize()).toEqual(this.loadedData.length);
        });
    });

    describe('When a data source has a mapping function', function () {
        beforeEach(function () {
            this.dataSource = new hx.DataSource({
                provider: [1, 2, 3],
                map: function (item) {
                    return {
                        value: item
                    };
                }
            });
        });

        it('should set the items observable to be the mapped data supplied', function () {
            expect(this.dataSource.items()).toEqual([{
                value: 1
            }, {
                value: 2
            }, {
                value: 3
            }]);
        });

        it('should set the pageItems observable to be the mapped data supplied', function () {
            expect(this.dataSource.pageItems()).toEqual([{
                value: 1
            }, {
                value: 2
            }, {
                value: 3
            }]);
        });
        
        it('should sort using the mapped property names', function () {
            this.dataSource.sortBy('value descending');
            expect(this.dataSource.pageItems()).toEqual([{
                value: 3
            }, {
                value: 2
            }, {
                value: 1
            }]);
        });
    });

    describe('When a data source has a mapping function that returns undefined', function () {
        beforeEach(function () {
            this.dataSource = new hx.DataSource({
                provider: [1, 2, 3],
                map: function (item) {
                    if ((item % 2) === 0) {
                        return {
                            value: item
                        };
                    }
                }
            });
        });

        it('should set ignore the undefined items when loading', function () {
            expect(this.dataSource.items()).toEqual([{
                value: 2
            }]);
        });

        it('should set the pageItems observable to be the mapped data supplied', function () {
            expect(this.dataSource.pageItems()).toEqual([{
                value: 2
            }]);
        });
    });
    describe('When a data source is created with a default sort order', function () {
        beforeEach(function () {
            this.loadedData = [{
                myProperty: 1
            }, {
                myProperty: 13
            }, {
                myProperty: 7
            }];

            this.dataSource = new hx.DataSource({
                initialSortOrder: 'myProperty ascending',
                provider: this.loadedData
            });
        });

        it('should set the items observable to be the sorted dataset', function () {
            expect(this.dataSource.items()).toEqual([{
                myProperty: 1
            }, {
                myProperty: 7
            }, {
                myProperty: 13
            }]);
        });

        it('should set the sortBy observable to be a string representation of the ordering', function () {
            expect(this.dataSource.sortBy()).toEqual('myProperty ascending');
        });

        it('should indicate a columns ordering through getPropertySortOrder', function () {
            expect(this.dataSource.getPropertySortOrder('myProperty')).toEqual('ascending');
        });
    });

    describe('When a data source is sorted by a single property, with complex data set and no paging', function () {
        beforeEach(function () {
            this.loadedData = [{
                myProperty: 1
            }, {
                myProperty: 13
            }, {
                myProperty: 7
            }];

            this.dataSource = new hx.DataSource({
                provider: this.loadedData
            });            

            this.dataSource.sortBy('myProperty');
        });

        it('should set the items observable to be the sorted dataset', function () {
            expect(this.dataSource.items()).toEqual([{
                myProperty: 1
            }, {
                myProperty: 7
            }, {
                myProperty: 13
            }]);
        });

        it('should set the sortBy observable to be a string representation of the ordering', function () {
            expect(this.dataSource.sortBy()).toEqual('myProperty ascending');
        });

        it('should indicate a columns ordering through getPropertySortOrder', function () {
            expect(this.dataSource.getPropertySortOrder('myProperty')).toEqual('ascending');
        });
    });

    describe('When a data source is sorted by multiple properties, with complex data set and no paging', function () {
        beforeEach(function () {
            this.loadedData = [{
                myProperty: 18,
                myOtherProperty: 1
            }, {
                myProperty: 7,
                myOtherProperty: 1
            }, {
                myProperty: 7,
                myOtherProperty: 4
            }];

            this.dataSource = new hx.DataSource({
                provider: this.loadedData
            });

            this.dataSource.sortBy('myProperty, myOtherProperty');
        });

        it('should set the sortBy observable to the normalised passed in properties', function () {
            expect(this.dataSource.sortBy()).toEqual('myProperty ascending, myOtherProperty ascending');
        });

        it('should set the items observable to be the sorted dataset, ascending default', function () {
            expect(this.dataSource.items()).toEqual([{
                myProperty: 7,
                myOtherProperty: 1
            }, {
                myProperty: 7,
                myOtherProperty: 4
            }, {
                myProperty: 18,
                myOtherProperty: 1
            }]);
        });
    });

    describe('When a data source is sorted after a load, with server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.sortedDataToReturn = [1, 4, 7, 8, 9, 13];
            this.loader = this.spy(function (o, callback) {
                callback({
                    items: _this.sortedDataToReturn,
                    totalCount: _this.sortedDataToReturn.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                serverPaging: 5
            });

            this.dataSource.load();

            this.dataSource.sortBy('aProperty ascending');
        });

        it('should pass the sortBy value as a parameter to loader', function () {
            expect(this.loader).toHaveBeenCalledWith({
                pageNumber: 1,
                pageSize: 5,
                orderBy: 'aProperty ascending'
            });
        });
    });
    describe('When a data source is loaded, with search parameters', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];
            this.loader = this.spy(function (o, callback) {
                return callback(_this.dataToReturn);
            });

            this.searchParameterObservable = ko.observable(10);

            this.dataSource = new hx.DataSource({
                searchParameters: {
                    "static": 5,
                    observable: this.searchParameterObservable
                },
                provider: this.loader
            });

            this.dataSource.load();
        });
        
        it('should call the loader with search parameters converted to plain values', function () {
            expect(this.loader).toHaveBeenCalledWith({
                "static": 5,
                observable: 10
            });
        });
    });

    describe('When search parameters change before an initial load', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];
            this.loader = this.spy(function (o, callback) {
                callback(_this.dataToReturn);
            });

            this.searchParameterObservable = ko.observable(10);
            this.dataSource = new hx.DataSource({
                searchParameters: {
                    "static": 5,
                    observable: this.searchParameterObservable
                },
                provider: this.loader
            });

            this.searchParameterObservable(25);
        });
        
        it('should not call the loader', function () {
            expect(this.loader).toHaveNotBeenCalled();
        });
    });

    describe('When search parameters change after an initial load', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];

            this.loader = this.spy(function (o, callback) {
                callback(_this.dataToReturn);
            });

            this.searchParameterObservable = ko.observable(10);

            this.dataSource = new hx.DataSource({
                searchParameters: {
                    "static": 5,
                    observable: this.searchParameterObservable
                },
                provider: this.loader
            });
            this.dataSource.load();

            expect(this.loader).toHaveBeenCalledOnce();
            
            this.searchParameterObservable(25);
        });

        it('should call the loader with search parameters converted to plain values', function () {
            expect(this.loader).toHaveBeenCalledTwice();
            expect(this.loader).toHaveBeenCalledWith({
                "static": 5,
                observable: 25
            });
        });

        it('should reset the pageNumber to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });
    });

    describe('When search parameters change after an initial load, with server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 4, 7, 8, 9, 13];

            this.loader = this.spy(function (o, callback) {
                callback(_this.dataToReturn);
            });

            this.searchParameterObservable = ko.observable(10);
            this.dataSource = new hx.DataSource({
                serverPaging: 5,
                searchParameters: {
                    "static": 5,
                    observable: this.searchParameterObservable
                },
                provider: this.loader
            });

            this.dataSource.load();

            expect(this.loader).toHaveBeenCalledOnce();

            this.searchParameterObservable(25);
        });
        
        it('should call the loader with search parameters converted to plain values', function () {
            expect(this.loader).toHaveBeenCalledTwice();
            expect(this.loader).toHaveBeenCalledWith({
                "static": 5,
                observable: 25,
                pageNumber: 1,
                pageSize: 5
            });
        });
    });

    describe('When a data source is loaded, with client paging and remote data', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 2, 3, 4, 5, 6, 7, 8];

            this.loader = this.spy(function (o, callback) {
                return callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5
            });

            this.dataSource.load();
        });

        it('should call the loader with an empty object as first parameter', function () {
            expect(this.loader).toHaveBeenCalledWith({});
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual(this.dataToReturn);
        });

        it('should set the pageItems observable to the first page of the return items', function () {
            expect(this.dataSource.pageItems()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 2', function () {
            expect(this.dataSource.pageCount()).toEqual(2);
        });

        it('should set the totalCount observable to the length of the loaded data', function () {
            expect(this.dataSource.totalCount()).toEqual(this.dataToReturn.length);
        });

        it('should set the pageSize observable to the clientPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });
    describe('When a pageNumber is changed, after first load, with client paging and remote data', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            this.loader = this.spy(function (o, callback) {
                callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5
            });

            this.dataSource.load();

            this.dataSource.pageNumber(2);
        });
        it('should not call the loader again', function () {
            expect(this.loader).toHaveBeenCalledOnce();
        });

        it('should set the pageItems observable to the page of items specified by page number', function () {
            expect(this.dataSource.pageItems()).toEqual([6, 7, 8, 9, 10]);
        });

        it('should not reset the pageNumber that has been set', function () {
            expect(this.dataSource.pageNumber()).toEqual(2);
        });

        it('should set the pageCount observable to 2', function () {
            expect(this.dataSource.pageCount()).toEqual(2);
        });

        it('should set the totalCount observable to the length of the loaded data', function () {
            expect(this.dataSource.totalCount()).toEqual(this.dataToReturn.length);
        });

        it('should set the pageSize observable to the clientPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });

    describe('When on the first page of multiple', function () {
        beforeEach(function () {
            var _this = this;

            this.dataToReturn = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            this.loader = this.spy(function (o, callback) {
                callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5
            });

            this.dataSource.load();
        });

        it('should indicate on the first page through isFirstPage observable', function () {
            expect(this.dataSource.isFirstPage).toBeObservable();
            expect(this.dataSource.isFirstPage()).toEqual(true);
        });

        it('should allow going to next page', function () {
            this.dataSource.goToNextPage();
            expect(this.dataSource.isFirstPage()).toEqual(false);
            expect(this.dataSource.pageNumber()).toEqual(2);
        });

        it('should not allow going to previous page', function () {
            this.dataSource.goToPreviousPage();
            expect(this.dataSource.isFirstPage()).toEqual(true);
            expect(this.dataSource.pageNumber()).toEqual(1);
        });
    });

    describe('When on the last page of multiple', function () {
        beforeEach(function () {
            var _this = this;
            this.dataToReturn = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            this.loader = this.spy(function (o, callback) {
                return callback(_this.dataToReturn);
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5
            });

            this.dataSource.load();
            this.dataSource.pageNumber(2);
        });

        it('should indicate on the last page through isLastPage observable', function () {
            expect(this.dataSource.isLastPage).toBeObservable();
            expect(this.dataSource.isLastPage()).toEqual(true);
        });

        it('should not allow going to next page', function () {
            this.dataSource.goToNextPage();
            expect(this.dataSource.isLastPage()).toEqual(true);
            expect(this.dataSource.pageNumber()).toEqual(2);
        });
        
        it('should allow going to previous page', function () {
            this.dataSource.goToPreviousPage();
            expect(this.dataSource.isLastPage()).toEqual(false);
            expect(this.dataSource.pageNumber()).toEqual(1);
        });
    });

    describe('When a data source is loaded, with server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                serverPaging: 5
            });

            this.dataSource.load();
        });

        it('should call the loader with pageSize and pageNumber parameters', function () {
            expect(this.loader).toHaveBeenCalledWith({
                pageSize: 5,
                pageNumber: 1
            });
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the pageItems observable to value passed back from the loader', function () {
            expect(this.dataSource.pageItems()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 2', function () {
            expect(this.dataSource.pageCount()).toEqual(2);
        });

        it('should set the totalCount observable to the value passed back from the loader', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });

        it('should set the pageSize observable to the serverPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });
    describe('When a data source is loaded, with server paging and 0 records', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                serverPaging: 5
            });

            this.dataSource.load();
        });

        it('should set totalCount to 0', function () {
            expect(this.dataSource.totalCount()).toEqual(0);
        });
    });

    describe('When a data source is loaded, with server paging and totalItems instead of totalCount', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalItems: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                serverPaging: 5
            });
            
            this.dataSource.load();
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the pageItems observable to value passed back from the loader', function () {
            expect(this.dataSource.pageItems()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the totalCount observable to the value passed back from the loader', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });
    });
    describe('When a pageNumber is changed, after first load, with server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                serverPaging: 5
            });

            this.dataSource.load();

            expect(this.loader).toHaveBeenCalledOnce();
            this.dataSource.pageNumber(2);
        });
        it('should call the loader again', function () {
            expect(this.loader).toHaveBeenCalledTwice();
        });

        it('should set the pageItems observable to the page of items specified by page number', function () {
            expect(this.dataSource.pageItems()).toEqual([6, 7, 8, 9, 10]);
        });

        it('should not reset the pageNumber that has been set', function () {
            expect(this.dataSource.pageNumber()).toEqual(2);
        });

        it('should set the pageCount observable to 2', function () {
            expect(this.dataSource.pageCount()).toEqual(2);
        });

        it('should set the totalCount observable to the value passed back from the loader', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });

        it('should set the pageSize observable to the serverPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });

    describe('When a data source is loaded, with client and server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;

                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5,
                serverPaging: 10
            });
            
            this.dataSource.load();
        });

        it('should call the loader with serverPaging pageSize and pageNumber parameters', function () {
            expect(this.loader).toHaveBeenCalledWith({
                pageSize: 10,
                pageNumber: 1
            });
        });

        it('should set the items observable to the value passed back from the loader', function () {
            expect(this.dataSource.items()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });

        it('should set the pageItems observable to the first page of the return items', function () {
            expect(this.dataSource.pageItems()).toEqual([1, 2, 3, 4, 5]);
        });

        it('should set the pageNumber observable to 1', function () {
            expect(this.dataSource.pageNumber()).toEqual(1);
        });

        it('should set the pageCount observable to 4, the client page count.', function () {
            expect(this.dataSource.pageCount()).toEqual(4);
        });

        it('should set the totalCount observable to the totalCount returned from the server', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });

        it('should set the pageSize observable to the clientPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });

    describe('When a data source is loaded, with high client to server page ratio', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 2,
                serverPaging: 10
            });
            
            this.dataSource.load();
        });

        it('should call the loader with serverPaging pageSize and pageNumber parameters', function () {
            expect(this.loader).toHaveBeenCalledWith({
                pageSize: 10,
                pageNumber: 1
            });
        });
        
        it('should correctly page items', function () {
            expect(this.dataSource.pageItems()).toEqual([1, 2]);
        });
    });

    describe('When a pageNumber is changed to page still within server page, after first load, with client and server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5,
                serverPaging: 10
            });

            this.dataSource.load();

            expect(this.loader).toHaveBeenCalledOnce();
            
            this.dataSource.pageNumber(2);
        });

        it('should not call the loader again', function () {
            expect(this.loader).toHaveBeenCalledOnce();
        });

        it('should set the pageItems observable to the page of items specified by page number', function () {
            expect(this.dataSource.pageItems()).toEqual([6, 7, 8, 9, 10]);
        });

        it('should not reset the pageNumber that has been set', function () {
            expect(this.dataSource.pageNumber()).toEqual(2);
        });

        it('should set the pageCount observable to 4', function () {
            expect(this.dataSource.pageCount()).toEqual(4);
        });

        it('should set the totalCount observable to the value passed back from the loader', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });

        it('should set the pageSize observable to the clientPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });
    
    describe('When a pageNumber is changed to page not within server page, after first load, with client and server paging', function () {
        beforeEach(function () {
            var _this = this;
            this.allServerData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            this.loader = this.spy(function (o, callback) {
                var end, start;
                start = (o.pageNumber - 1) * o.pageSize;
                end = start + o.pageSize;
                
                callback({
                    items: _this.allServerData.slice(start, end),
                    totalCount: _this.allServerData.length
                });
            });

            this.dataSource = new hx.DataSource({
                provider: this.loader,
                clientPaging: 5,
                serverPaging: 10
            });

            this.dataSource.load();
            expect(this.loader).toHaveBeenCalledOnce();
            this.dataSource.pageNumber(3);
        });
        
        it('should call the loader again', function () {
            expect(this.loader).toHaveBeenCalledTwice();
        });

        it('should call the loader with serverPaging pageSize and pageNumber parameters', function () {
            expect(this.loader).toHaveBeenCalledWith({
                pageSize: 10,
                pageNumber: 2
            });
        });

        it('should set the pageItems observable to the page of items specified by page number', function () {
            expect(this.dataSource.pageItems()).toEqual([11, 12, 13, 14, 15]);
        });

        it('should not reset the pageNumber that has been set', function () {
            expect(this.dataSource.pageNumber()).toEqual(3);
        });

        it('should set the pageCount observable to 4', function () {
            expect(this.dataSource.pageCount()).toEqual(4);
        });

        it('should set the totalCount observable to the value passed back from the loader', function () {
            expect(this.dataSource.totalCount()).toEqual(this.allServerData.length);
        });

        it('should set the pageSize observable to the clientPaging size', function () {
            expect(this.dataSource.pageSize()).toEqual(5);
        });
    });
});