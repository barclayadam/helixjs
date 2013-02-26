hx.provide('$OdataProvider', ['$ajax'], function($ajax) {
    function $OdataProvider(options) {
        this.options = options;
    }

    $OdataProvider.prototype.fn = {
        service: function(dataSource, parameters, serviceName) {
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

        return $ajax.url(uri.toString()).get();
    }

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