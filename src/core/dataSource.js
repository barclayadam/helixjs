function toOrderDirection(order) {
    if (order === void 0 || order === 'asc' || order === 'ascending') {
        return 'ascending';
    } else {
        return 'descending';
    }
};

/**
# A DataSource is a representation of an array of data (of any kind) that
# is represented in a consistent manner, providing functionality such as
# server and client-side paging and sorting over the top of a `data provider`,
# a method of loading said data (e.g. directly providing an array, using a
# `query` to load data or any operation that can provide an array of data).
#
# #Paging#
#
# The data source supports client and server side paging, with the ability to
# have both enabled within a single source of data which can be useful to
# provide a small paging size for display purposes yet a larger server-side
# page to allow fewer calls back to the server to be made.
#
# If paging is enabled then the `pageNumber`, `pageSize`, `pages` and `pageItems` 
# observable properties becomes important, as they represent the (client-side)
# page (1-based) currently being represented by the `pageItems` observable, the
# size of the client-side page and an observable array of pages, an object with
# `pageNumber` and `isSelected` properties, in addition to a `select` method to
# select the represented page.
#
# ##Client-Side Paging##
#
# To enable client-side paging the `clientPaging` option must be provided in
# the `options` at construction time, specifying the size of the page. Once this
# option has been enabled `pageItems` will be the items to display for the
# current (see `pageNumber`) page.
#
# ##Server-Side Paging##
#
# To enable server-side paging the `serverPaging` option must be provided in 
# the `options` at construction time, specifying the size of the page. In addition
# the `provider` must correctly adhere to the page size and number passed to it as 
# the `pageSize` and `pageNumber` properties of its `loadOptions` parameter.
#
# When server-side paging is enabled the server must handle, if specified by the
# options of the `DataSource`:
#
# * Paging
# * Sorting
# * Filtering
# * Grouping
*/
hx.DataSource = (function () {

    function DataSource(options) {
        var _this = this;
        this.options = options;

        /** An observable property that represents whether or not this data source is
            currently loading some data (using the specified `provider`). */
        this.isLoading = ko.observable(false);

        this._hasLoadedOnce = false;
        this._serverPagingEnabled = this.options.serverPaging > 0;
        this._clientPagingEnabled = this.options.clientPaging > 0;

        this.pagingEnabled = this._serverPagingEnabled || this._clientPagingEnabled;

        /** Stores the items as loaded (e.g. without sorting / paging applied
            when in client-side only mode). */
        this._loadedItems = ko.observableArray();

        this._sorter = new hx.Sorter;

        /** 
          The sorting order of this `DataSource`, a textual
          description of the properties by which the data is sorted.
        
          This value, when populated, will be a comma-delimited string
          with each value being the name of the property being sorted
          followed by the order (`ascending` or `descending`):
        
          `property1 ascending[, property2 descending]` 
        */
        this.sortBy = ko.computed({
            read: function () {
                return _this._sorter.toString();
            },

            write: function (value) {
                _this._sorter.setSortOrder(value);
            }
        });

        /** The items that have been loaded, presented sorted, filtered and
            grouped as determined by the options passed to this `DataSource`. */
        this.items = ko.computed(function () {
            if (!_this._serverPagingEnabled) {
                return _this._sorter.sort(_this._loadedItems());
            } else {
                return _this._loadedItems();
            }
        });

        if (this.options.searchParameters != null) {
            this.searchParameters = ko.computed(function () {
                return ko.toJS(options.searchParameters);
            });

            this.searchParameters.subscribe(function () {
                if (_this._hasLoadedOnce) {
                    _this.load();
                }
            });
        } else {
            this.searchParameters = ko.observable({});
        }

        this._setupPaging();
        this._setupInitialData();
    }

    DataSource.prototype.getPropertySortOrder = function (propertyName) {
        return this._sorter.getPropertySortOrder(propertyName);
    };

    /**
      Removes the given item from this data source.
    
      TODO: Define this method in such a way that it will handle server paging
      better (currently leaves a 'gap', will reshow this item if user visits another
      page then goes back to the page this item is on).
    */
    DataSource.prototype.remove = function (item) {
        return this._loadedItems.remove(item);
    };

    /**
      Performs a load of this data source, which will set the pageNumber to 1
      and then, using the `provider` specified on construction, load the
      items uing the current search parameters (if any), the page size (if `serverPaging`
      is enabled), the current order, and the page number (i.e. 1).
    */
    DataSource.prototype.load = function () {
        var currentPageNumber = this.pageNumber();

        this.pageNumber(1);


        /* 
          serverPaging enabled means subscription to
          pageNumber to perform re-load so only execute
          immediately if not enabled, or if current page number
          is 1 as then subscription not called. 
        */
        if (!this._serverPagingEnabled || currentPageNumber === 1) {
            this._doLoad();
        }
    };

    /**  Goes to the specified page number. */
    DataSource.prototype.goTo = function (pageNumber) {
        this.pageNumber(pageNumber);
    };

    /** Goes to the first page, assuming that either client or server-side paging
        has been enabled. */
    DataSource.prototype.goToFirstPage = function () {
        this.goTo(1);
    };

    /** Goes to the last page, assuming that either client or server-side paging
        has been enabled. */
    DataSource.prototype.goToLastPage = function () {
        this.goTo(this.pageCount());
    };

    /** 
      Goes to the next page, assuming that either client or server-side paging
      has been enabled at the current page is not the last one (in which case
      no changes will be made). 
    */
    DataSource.prototype.goToNextPage = function () {
        if (!this.isLastPage()) {
            this.goTo(this.pageNumber() + 1);
        }
    };

    /**
      Goes to the previous page, assuming that either client or server-side paging
      has been enabled at the current page is not the first one (in which case
      no changes will be made).
    */
    DataSource.prototype.goToPreviousPage = function () {
        if (!this.isFirstPage()) {
            this.goTo(this.pageNumber() - 1);
        }
    };

    DataSource.prototype._setupInitialData = function () {
        if ((this.options.provider != null) && _.isArray(this.options.provider)) {
            this._setData(this.options.provider);
            this.goTo(1);
        }

        if (this.options.initialSortOrder != null) {
            this.sortBy(this.options.initialSortOrder);
        }

        if (this.options.autoLoad === true) {
            this.load();
        }
    };

    DataSource.prototype._setupPaging = function () {
        var _this = this;

        this._lastProviderOptions = -1;
        this.clientPagesPerServerPage = this.options.serverPaging / (this.options.clientPaging || this.options.serverPaging);

        this.pageSize = ko.observable();
        this.totalCount = ko.observable(0);

        this.pageNumber = ko.observable().extend({
            publishable: {
                message: (function (p) {
                    return "pageChanged:" + p();
                }),

                bus: this
            }
        });

        /** 
          The observable typically bound to in the UI, representing the
          current `page` of items, which if paging is specified will be the
          current page as defined by the `pageNumber` observable, or if
          no paging options have been supplied the loaded items.
        */
        this.pageItems = ko.computed(function () {
            var end, start;
            if (_this._clientPagingEnabled && _this._serverPagingEnabled) {
                start = ((_this.pageNumber() - 1) % _this.clientPagesPerServerPage) * _this.pageSize();
                end = start + _this.pageSize();

                return _this.items().slice(start, end);
            } else if (_this._clientPagingEnabled) {
                start = (_this.pageNumber() - 1) * _this.pageSize();
                end = start + _this.pageSize();

                return _this.items().slice(start, end);
            } else {
                return _this.items();
            }
        });

        /** An observable property that indicates the number of pages that
            exist within this data source. */
        this.pageCount = ko.computed(function () {
            if (_this.totalCount()) {
                return Math.ceil(_this.totalCount() / _this.pageSize());
            } else {
                return 0;
            }
        });

        /** An observable property that indicates whether the current page 
            is the first one. */
        this.isFirstPage = ko.computed(function () {
            return _this.pageNumber() === 1;
        });

        /** An observable property that indicates whether the current page 
            is the last one. */
        this.isLastPage = ko.computed(function () {
            return _this.pageNumber() === _this.pageCount() || _this.pageCount() === 0;
        });

        /** Server paging means any operation that would affect the
            items loaded and currently displayed must result in a load. */
        if (this.options.serverPaging) {
            this.pageNumber.subscribe(function () {
                _this._doLoad();
            });

            this.sortBy.subscribe(function () {
                 _this._doLoad();
            });
        }
    };

    DataSource.prototype._doLoad = function () {
        var loadOptions,
        _this = this;

        if (_.isArray(this.options.provider)) {
            return;
        }

        loadOptions = _.extend({}, this.searchParameters());

        if (this._serverPagingEnabled) {
            loadOptions.pageSize = this.options.serverPaging;
            loadOptions.pageNumber = Math.ceil(this.pageNumber() / this.clientPagesPerServerPage);
        }

        if (this.sortBy() !== "") {
            loadOptions.orderBy = this.sortBy();
        }

        if (_.isEqual(loadOptions, this._lastProviderOptions)) {
            return;
        }

        this.isLoading(true);

        return this.options.provider(loadOptions, (function (loadedData) {
            _this._setData(loadedData);
            _this._lastProviderOptions = loadOptions;
            _this.isLoading(false);
        }), this);
    };

    DataSource.prototype._setData = function (loadedData) {
        var items = [];

        if (this.options.serverPaging) {
            items = loadedData.items;
            this.pageSize(this.options.clientPaging || this.options.serverPaging);
            this.totalCount(loadedData.totalCount || loadedData.totalItems || 0);
        } else {
            items = loadedData;
            this.pageSize(this.options.clientPaging || loadedData.length);
            this.totalCount(loadedData.length);
        }

        if (this.options.map != null) {
            items = _.chain(items).map(this.options.map).compact().value();
        }

        this._loadedItems(items);
        this._hasLoadedOnce = true;
    };

    return DataSource;

})();