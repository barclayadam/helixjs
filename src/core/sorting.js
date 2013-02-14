function toOrderDirection(order) {
    if (order === void 0 || order === 'asc' || order === 'ascending') {
        return 'ascending';
    } else {
        return 'descending';
    }
};

hx.Sorter = (function () {
    function Sorter(definition) {
        this.definition = ko.observable('');

        if (definition != null) {
            this.setSortOrder(definition);
        }
    }

    Sorter.prototype.setSortOrder = function (definition) {
        return this.definition(_(definition.split(',')).map(function (p) {
            var indexOfSpace;
            p = ko.utils.stringTrim(p);
            indexOfSpace = p.indexOf(' ');

            if (indexOfSpace > -1) {
                return {
                    name: p.substring(0, indexOfSpace),
                    order: toOrderDirection(p.substring(indexOfSpace + 1))
                };
            } else {
                return {
                    name: p,
                    order: 'ascending'
                };
            }
        }));
    };

    /**
      Sorts the specified array using the definition that has previously
      been set for this sorter, or returning the array as-is if not
      sorting definition has been specified. 
    */
    Sorter.prototype.sort = function (array) {
        var _this = this;

        if (this.definition()) {
            return array.sort(function (a, b) {
                var p, _i, _len, _ref;
                _ref = _this.definition();

                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    p = _ref[_i];

                    if (a[p.name] > b[p.name]) {
                        if (p.order === 'ascending') {
                            return 1;
                        } else {
                            return -1;
                        }
                    }

                    if (a[p.name] < b[p.name]) {
                        if (p.order === 'ascending') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }

                return 0;
            });
        } else {
            return array;
        }
    };

    /**
      Gets the sort order of the specified property, returning `undefined`
      if the property has no sort order defined. The string values are the
      long-form description, either `ascending` or `descending`, regardless of
      how they will originally specified.
    */
    Sorter.prototype.getPropertySortOrder = function (propertyName) {
        var ordering;

        if ((this.definition() != null) && this.definition().length > 0) {
            ordering = _.find(this.definition(), function (o) {
                return o.name === propertyName;
            });

            return ordering != null ? ordering.order : void 0;
        }
    };

    /**
     Returns a string representation of this `Sorter`, defined as a
     comma-delimited list of property names and their sort order (always
     the full `descending` or `ascending` string value):
    
     `propertyName [ascending|descending](, propertyName [ascending|descending])*
    */
    Sorter.prototype.toString = function () {
        return _.reduce(this.definition(), (function (memo, o) {
            var prop = "" + o.name + " " + o.order;

            if (memo) {
                return "" + memo + ", " + prop;
            } else {
                return prop;
            }
        }), '');
    };

    return Sorter;
})();