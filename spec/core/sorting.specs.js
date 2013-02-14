describe('Sorter', function () {
    beforeEach(function () {
        this.unsorted = [{
            id: 'ab',
            name: 'Adam Barclay',
            age: 22,
            dob: new Date(1988, 4, 14)
        }, {
            id: 'js',
            name: 'John Smith',
            age: 42,
            dob: new Date(1968, 5, 24)
        }, {
            id: 'abOlder',
            name: 'Adam Barclay',
            age: 30,
            dob: new Date(1980, 5, 24)
        }, {
            id: 'mj',
            name: 'Mary Jones',
            age: 30,
            dob: new Date(1980, 5, 24)
        }];
    });

    describe('no definition given', function () {
        it('should perform no sort', function () {
            var sorted;
            sorted = (new hx.Sorter()).sort(this.unsorted);
            expect(_.pluck(sorted, 'id')).toEqual(['ab', 'js', 'abOlder', 'mj']);
        });

        it('should have sort order as an observable', function () {
            var sorter;
            sorter = new hx.Sorter();
            expect(sorter.definition).toBeObservable();
        });
    });

    describe('by string definition', function () {
        describe('single property sorting', function () {
            it('should sort by default ascending', function () {
                var sorted;
                sorted = (new hx.Sorter('name')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['ab', 'abOlder', 'js', 'mj']);
            });

            it('should sort by descending if desc modifier specified', function () {
                var sorted;
                sorted = (new hx.Sorter('name desc')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['mj', 'js', 'ab', 'abOlder']);
            });

            it('should sort by descending if descending modifier specified', function () {
                var sorted;
                sorted = (new hx.Sorter('name descending')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['mj', 'js', 'ab', 'abOlder']);
            });

            it('should fully qualify with default ascending direction when converting to string', function () {
                var definition;
                definition = (new hx.Sorter('name')).toString();
                expect(definition).toEqual('name ascending');
            });

            it('should enable getting sort order by property name', function () {
                var sorter;
                sorter = new hx.Sorter('name ascending');
                expect(sorter.getPropertySortOrder('name')).toEqual('ascending');
            });

            it('should return undefined when asked for sort order of property not ordered', function () {
                var sorter;
                sorter = new hx.Sorter('name ascending');
                expect(sorter.getPropertySortOrder('nonProperty')).toEqual(void 0);
            });
        });

        describe('multiple property sorting', function () {
            it('should sort by default ascending', function () {
                var sorted;
                sorted = (new hx.Sorter('name, age')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['ab', 'abOlder', 'js', 'mj']);
            });
            
            it('should sort by descending if desc modifier specified', function () {
                var sorted;
                sorted = (new hx.Sorter('name, age desc')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['abOlder', 'ab', 'js', 'mj']);
            });

            it('should handle different directions in each property', function () {
                var sorted;
                sorted = (new hx.Sorter('name descending, age asc')).sort(this.unsorted);
                expect(_.pluck(sorted, 'id')).toEqual(['mj', 'js', 'ab', 'abOlder']);
            });

            it('should fully qualify with direction when converting to string', function () {
                var definition;
                definition = (new hx.Sorter('name desc, age ascending')).toString();
                expect(definition).toEqual('name descending, age ascending');
            });

            it('should enable getting sort order by property name', function () {
                var sorter;
                sorter = new hx.Sorter('name desc, age ascending');
                expect(sorter.getPropertySortOrder('name')).toEqual('descending');
                expect(sorter.getPropertySortOrder('age')).toEqual('ascending');
            });

            it('should return undefined when asked for sort order of property not ordered', function () {
                var sorter;
                sorter = new hx.Sorter('name ascending');
                expect(sorter.getPropertySortOrder('nonProperty')).toEqual(void 0);
            });
        });
    });
});