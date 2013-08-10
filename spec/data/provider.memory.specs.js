describe('dataView providers - memory', function() {
    var $DataView = hx.get('$DataView'),
        $InMemoryProvider = hx.get('$InMemoryProvider');

    beforeEach(function() {
        function createItem(n) {
            return {
                numberProperty: n
            }
        }

        this.data = ko.observable(_.map(_.range(25), function(n) { return createItem(n); }));
        this.dataView = $DataView.from($InMemoryProvider({ data: this.data }))
    })

    it('should return complete data set when no options specified', function() {
        this.dataView.load();

        expect(this.dataView.data()).toEqual(this.data());
    })

    it('should handle take param', function() {
        this.dataView.take(5).load();

        expect(this.dataView.data()).toEqual(this.data().slice(0, 5));
    })

    it('should handle skip param', function() {
        this.dataView.skip(5).load();

        expect(this.dataView.data()).toEqual(this.data().slice(5, 25));
    })

    it('should handle paging', function() {
        this.dataView.page(2).pageSize(5).load();

        expect(this.dataView.data()).toEqual(this.data().slice(5, 10));
        expect(this.dataView.totalCount()).toEqual(25);
        expect(this.dataView.pageCount()).toEqual(5);
    })

    it('should handle filtering (where) by applying function to values', function() {
        this.dataView.where(function(i) {
            return i.numberProperty % 10 == 0;
        }).load();

        expect(this.dataView.data()).toEqual([this.data()[0], this.data()[10], this.data()[20]]);
    })

    it('should handle filtering (where) by modifying totalCount to be the total *after* filtering', function() {
        this.dataView.where(function(i) {
            return i.numberProperty % 10 == 0;
        }).load();

        expect(this.dataView.totalCount()).toEqual(3);
    })

    it('should handle filtering (where) with parameters passed to where function', function() {
        this.dataView
            .params({ aParam: 10 })
            .where(function(i, params) {
                return i.numberProperty % params.aParam == 0;
            })
            .load();

        expect(this.dataView.data()).toEqual([this.data()[0], this.data()[10], this.data()[20]]);
    })

    it('should handle mapping (where)', function() {
        this.data([{ numberProperty: 1}, { numberProperty: 2 }]);

        this.dataView.map(function(i) {
            return { mappedProperty: i.numberProperty };
        }).load();

        expect(this.dataView.data()).toEqual([{ mappedProperty: 1 }, { mappedProperty: 2 }]);
    })

    it('should handle orderBy', function() {
        this.data(_.map(_.range(10), function(n) { return { numberProperty: n } }));
        var reversed = _.map(_.range(10), function(n) { return { numberProperty: 9 - n } });

        this.dataView.orderBy('numberProperty desc').load();

        expect(this.dataView.data()).toEqual(reversed);
    })

    it('should handle groupBy', function() {
        this.data([
            { group: 'A',  numberProperty: 1 },
            { group: 'A',  numberProperty: 2 },
            { group: 'B',  numberProperty: 1 },
            { group: 'B',  numberProperty: 2 }
        ]);

        this.dataView.groupBy('group').load();

        expect(this.dataView.data()).toEqual({
            'A': [
                { group: 'A',  numberProperty: 1 },
                { group: 'A',  numberProperty: 2 },
            ],

            'B': [
                { group: 'B',  numberProperty: 1 },
                { group: 'B',  numberProperty: 2 }
            ]
        });
    })

    describe('multiple-options', function() {

        it('skip and take', function() {
            this.dataView.skip(3).take(5).load();

            expect(this.dataView.data()).toEqual(this.data().slice(3, 8));
        })

        it('filtering (where) and paging', function() {
            this.dataView.where(function(n) {
                return n.numberProperty % 2 == 0;
            }).page(2).pageSize(5).load();

            // Filtered would be: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24

            expect(this.dataView.data()).toEqual([
                this.data()[10], 
                this.data()[12], 
                this.data()[14], 
                this.data()[16], 
                this.data()[18]
            ]);
        })

        it('order by and paging', function() {
            this.dataView.orderBy('numberProperty desc').page(2).pageSize(5).load();

            expect(this.dataView.data()).toEqual([
                this.data()[19], 
                this.data()[18], 
                this.data()[17], 
                this.data()[16], 
                this.data()[15]
            ]);
        })

        it('group by and paging', function() {
            this.data([
                { group: 'A',  numberProperty: 1 },
                { group: 'A',  numberProperty: 2 },
                { group: 'B',  numberProperty: 1 },
                { group: 'B',  numberProperty: 2 },
                { group: 'C',  numberProperty: 1 },
                { group: 'C',  numberProperty: 2 },
                { group: 'D',  numberProperty: 1 },
                { group: 'D',  numberProperty: 2 }
            ]);

            this.dataView
                .groupBy('group')
                .page(1)
                .pageSize(2)
                .load();

            expect(this.dataView.data()).toEqual({
                'A': [
                    { group: 'A',  numberProperty: 1 },
                    { group: 'A',  numberProperty: 2 },
                ],

                'B': [
                    { group: 'B',  numberProperty: 1 },
                    { group: 'B',  numberProperty: 2 }
                ]
            });
        })

        it('should only map items after they have been filtered', function() {  
            var mapStub = this.stub().returns({ aMappedProperty: 4 });

            this.dataView
                .where(function(n) { return n.numberProperty % 2 == 0; })
                .map(mapStub)
                .load();

            // Filtered out odd numbered items, should be called 13 times
            expect(mapStub.callCount).toEqual(13);
        })

        it('should only map paged items after they have been paged - take option', function() {  
            var mapStub = this.stub().returns({ aMappedProperty: 4 });

            this.dataView
                .take(12)
                .map(mapStub)
                .load();

            // Filtered out odd numbered items, should be called 13 times
            expect(mapStub.callCount).toEqual(12);
        })

        it('should only map paged items after they have been paged - page and pageSize option', function() {  
            var mapStub = this.stub().returns({ aMappedProperty: 4 });

            this.dataView
                .page(2).pageSize(8)
                .map(mapStub)
                .load();

            // Filtered out odd numbered items, should be called 13 times
            expect(mapStub.callCount).toEqual(8);
        })
    })

    it('should request load if the observable data source is updated', function() {
        this.dataView.skip(3).take(5).load();

        // Change to a simple array
        this.data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

        expect(this.dataView.data()).toEqual([4, 5, 6, 7, 8])

    })
})