hx.provide('$OdataProvider', ['$ajax'], function($ajax) {
    function $OdataProvider(options) {
        this.options = options;
    }

    $OdataProvider.prototype.fn = {
        /**
         * Specifies the service operation to call.
         *
         * @param {hx.DataSource} dataSource The data source this method is being called on
         * @param {object} parameter The parameter store to which new parameters can be attached
         * @param {string} serviceName The name of the service operation to use, passed by clients 
         *   of the data source.
         */
        operation: function(dataSource, parameters, serviceName) {
            parameters.serviceName = serviceName;
        }
    }

    $OdataProvider.prototype.load = function(loadOptions) {
        var uri = new hx.Uri(this.options.root + loadOptions.serviceName);

        if(loadOptions.where) {
            if(_.isFunction(loadOptions.where)) {
                uri.variables['$filter'] = loadOptions.where(loadOptions.params);
            } else {
                uri.variables['$filter'] = loadOptions.where;
            }
        }

        if(loadOptions.orderBy) uri.variables['$orderby'] = loadOptions.orderBy;

        if(loadOptions.take) uri.variables['$take'] = loadOptions.take;
        if(loadOptions.skip) uri.variables['$skip'] = loadOptions.skip;

        if(loadOptions.page) {
            uri.variables['$take'] = loadOptions.pageSize;
            uri.variables['$skip'] = (loadOptions.page - 1) * loadOptions.pageSize;
        }

        if(loadOptions.take || loadOptions.skip || loadOptions.page) {
            uri.variables['$inlinecount'] = 'allpages';            
        }

        return $ajax
            .url(uri.toString())
            .get();
    }

    /**
     * Normalises the result from an OData data source, converting the result from OData-specific
     * conventions to that of the DataSource. 
     *
     * If an OData-formatted result set is not returned then no processing will occur, allowing an 
     * endpoint to accept OData querying abilities without conforming to the complete OData protocol.
     *
     * @param {Mixed} result The result to be processed
     * @param {object} loadOptions The options used to generate the given result, ignored.
     */
    $OdataProvider.prototype.processResult = function(result, loadOptions) {
        if(result.d && result.d.results) {
            return result.d.results;
        } if(result.d) {
            return result.d;            
        }

        return result;
    }

    return $OdataProvider;
})