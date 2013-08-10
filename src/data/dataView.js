hx.provide('$DataView', function() {
    /** 
     * @class $DataView 
     */
    function DataView(provider) {
        if(_.isFunction(provider)) {
            // Ensure if a function is supplied as a provider it conforms to
            // provider interface (e.g. it becomes the `load` function)
            this.$$provider = { load: provider };
        } else {
            this.$$provider = provider;
        }

        this.$$initialisedProvider = false;

        // A provider can provide extra methods which will be exposed on this data source
        // through proxying. For each method defined a new one will be created on the
        // DataView that will pass through the DataView, a parameter store and all
        // arguments provided by the consumer of the new method.
        if(provider.fn) {
            for(var key in provider.fn) {
                var fn = provider.fn[key];

                this[key] = function() {
                    fn.apply(this, [this, this.$$parameters].concat(_.toArray(arguments)));

                    return this;
                }.bind(this);
            }
        }

        this.$$parameters = {};

        /**
         * Stores the data that has been loaded by this data source, which will be an array
         * of (optionally) mapped items.
         *
         * The values stored here will not contain extra metadata returned from the provider,
         * it is meant to be consumed outside of the data source as a simple array of objects,
         * other metadata such as total counts (when paging) are provided on the data source
         * instance. 
         *
         * @observable
         * @property data
         */
        this.data = ko.observable();

        /**
         * The total count of items, as set the last time this data source was loaded.
         *
         * If this data source has been paged then the totalCount represents the number
         * of items represented by the query, *before* paging, otherwise it is the same
         * as `data().length`.
         *
         * @observable
         * @property totalCount
         */
        this.totalCount = ko.observable();

        /**
         * The number of pages that are represented by the query this data source has been
         * configured for.
         *
         * If no paging has been specified for this data source this value will be 1.
         *
         * @observable
         * @property pageCount
         */
        this.pageCount = ko.observable();
    }

    function createParamMethod(propertyName) {
        return function(value) {
            if(value) {
                this.$$parameters[propertyName] = value;

                return this;
            } else {
                return this.$$parameters[propertyName];
            }
        }
    }

    /**
     * Sets a function that can be used to filter the results, a function that will
     * be called with a single parameter of an item (called once per item) and must return
     * a boolean value to indicate whether that item should be included in the result set.
     *
     * @method where
     * @param {function} whereFn - The function applied to filter out results.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.where = createParamMethod('where');

    /**
     * Sets an object that will be passed through to the provider of this
     * data source, to allow for arbritary options and parameters that providers
     * can decide what to do with at load time.
     *
     * @method params
     * @param {object|observable<object>} params - The parameters to pass through.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.params = createParamMethod('params');

    /**
     * A property that the data should be ordered by, as a string, or undefined to
     * remove any previous order by clause.
     *
     * @method orderBy
     * @param {string} orderBy - The property to order the data by.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.orderBy = createParamMethod('orderBy');

    /**
     * A property by which to group the data, which results in a transformed result
     * set such that an array of items will be turned into an object with the
     * values of the grouped property being keys and the values being a list of
     * items within that group.
     *
     * @method groupBy
     * @param {string} groupBy - The property to group results by, or undefined to remove
     *   any previous group by clauses.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.groupBy = createParamMethod('groupBy');

    /**
     * Specifies the number of items that should be 'taken', such that given a result
     * set of 100 and a parameter of 10, only 10 items will be stored within this
     * data source, starting at an offset specified by the {@link skip} property.
     *
     * @method take
     * @param {integer} take - The number of items to be returned.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.take = createParamMethod('take');

    /**
     * Specifies the number of items to skip from the start before returning any values. This
     * property, when combined with the {@link take} property can be used to implement paging.
     *
     * @method skip
     * @param {integer} skip - The number of items to skip before returning data.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.skip = createParamMethod('skip');

    /**
     * Specifies the page (1-based) of items to fetch from the DataView, to be used in conjunction
     * with the {@link pageSize} option to provide paging semantics over the data from the provider.
     *
     * @method page
     * @param {integer} page - The current page to retrieve.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.page = createParamMethod('page');

    /**
     * Specifies the page size that should be fetched from the data provider.
     *
     * @method pageSize
     * @param {integer} pageSize - The size of the page to retrieve
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.pageSize = createParamMethod('pageSize');

    /**
     * Specifies a mapping function, a function that will be passed each data item that has been
     * loaded to allow mapping from the raw data representation to another model more suited for
     * display and manipulation purposes.
     *
     * @method map
     * @param {function} mapFn - The mapping function to use.
     * @return {DataView} - Returns this data source, to allow chaining further calls.
     */
    DataView.prototype.map = createParamMethod('map');

    /**
     * Loads data from the data provider using the currently configured properties. 
     *
     * ## Auto Reload
     * 
     * Once the load method has been called once any subsequent change that is detected 
     * in any properties that are observables.
     *
     * @method load
     */
    DataView.prototype.load = function() {
        if(!this.$$initialisedProvider) {
            if(this.$$provider.initialise) {
                this.$$provider.initialise(this);
            }

            this.$$initialisedProvider = true;
        }

        if(this.$$paramsObservable == undefined) {
            this.$$paramsObservable = ko.computed(function() {
                return ko.toJS(this.$$parameters);
            }.bind(this))

            this.$$paramsObservable.subscribe(this.load, this);
        }

        var providerReturn = this.$$provider.load(this.$$paramsObservable());

        hx.utils.asPromise(providerReturn).done(function(result) {
            if(this.$$provider.processResult && result) {
                result = this.$$provider.processResult(result, this.$$paramsObservable());
            }

            result = result || { totalCount: 0, items: [] };

            // TODO: Verification of result (e.g. must be paged if option specified)
            // if we are paged
            if(result.totalCount != null) {
                this.totalCount(result.totalCount);
                this.pageCount(Math.ceil(result.totalCount / this.pageSize()));

                this.data(result.items);
            } else {
                this.totalCount(result.length);
                this.pageCount(1);

                this.data(result);
            }
        }.bind(this));
    }

    return {
        /**
         * Creates a new $DataView, using the given provider
         *
         * @method from
         * @static
         */
        from: function(provider) {
            return new DataView(provider);
        }
    }
})