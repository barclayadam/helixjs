hx.provide('$InMemoryProvider', function() {
    function $InMemoryProvider(options) {
        this.options = options;
    }

    function getSliceRange(dataLength, loadOptions) {
        var start = 0,
            end = dataLength;

        if(loadOptions.skip) start = loadOptions.skip;
        if(loadOptions.take) end = start + loadOptions.take;

        if(loadOptions.page) {
            start = (loadOptions.page - 1) * loadOptions.pageSize;
            end = start + loadOptions.pageSize;
        }

        return [Math.max(start, 0), Math.min(end, dataLength)];
    }

    /**
     * Initialises this provider by setting up auto-load that requests
     * a data load from the dataSource if the data this provider
     * represents is updated (assuming it is observable).
     */
    $InMemoryProvider.prototype.initialise = function(dataSource) {
        if(ko.isObservable(this.options.data)){
            this.options.data.subscribe(function() {
                dataSource.load();
            });
        }
    }

    $InMemoryProvider.prototype.load = function(loadOptions) {
        var data = this.options.data(),
            totalCount = data.length;

        if(loadOptions.where) {
            data = _.filter(data, function(i) {
                return loadOptions.where(i, loadOptions.params);
            })
        }

        if(loadOptions.orderBy) {
            var sorter = new hx.Sorter().setSortOrder(loadOptions.orderBy);

            data = sorter.sort(data.slice(0));
        }

        // We need to split here for grouping purposes because the return type
        // changes from an array to an object (e.g. A: [], B: []) so slicing
        // and mapping needs to change.
        if(!loadOptions.groupBy) {
            if(loadOptions.take || loadOptions.skip || loadOptions.page) {
                var startAndEnd = getSliceRange(data.length, loadOptions);

                data = data.slice(startAndEnd[0], startAndEnd[1]);
            }

            if(loadOptions.map) {
                data = _.map(data, loadOptions.map);
            }

        } else {
            data = _.groupBy(data, loadOptions.groupBy);

            if(loadOptions.take || loadOptions.skip || loadOptions.page) {
                var startAndEnd = getSliceRange(_.keys(data).length, loadOptions),
                    pagedData = {},
                    i = 0;

                for(var key in data) {
                    if(i >= startAndEnd[0] && i < startAndEnd[1]) {
                        pagedData[key] = data[key];
                    }

                    i = ++i;
                }

                data = pagedData;
            }

            if(loadOptions.map) {
                for(var key in data) {
                    data[key] = _.map(data[key], loadOptions.map);
                }
            }
        }

        return {
            totalCount: totalCount,
            items: data
        }
    }

    return $InMemoryProvider;
})