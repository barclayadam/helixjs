describe('dataSource providers - odata', function() {
    var $DataSource = hx.get('$DataSource'),
        $OdataProvider = hx.get('$OdataProvider'),
        $ajax = hx.get('$ajax');

    beforeEach(function() {
        this.getStub = getStub = this.stub();

        this.stub($ajax, 'url', function(url) {
            this.urlCalledWith = url;

            return { get: getStub };
        }.bind(this));

        this.provider = new $OdataProvider({ root: '/api/' });

        this.dataSource = $DataSource
            .from(this.provider)
            .service('MyService');
    })

    describe('querying', function() {
        it('should return complete data set when no options specified', function() {
            this.dataSource.load();

            expect(this.urlCalledWith).toEqual('/api/MyService');
            expect(this.getStub).toHaveBeenCalled();
        })

        it('should handle take param', function() {
            this.dataSource.take(5).load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$take=5&$inlinecount=allpages');
        })

        it('should handle skip param', function() {
            this.dataSource.skip(5).load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$skip=5&$inlinecount=allpages');
        })

        it('should handle paging', function() {
            this.dataSource.page(2).pageSize(5).load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$take=5&$skip=5&$inlinecount=allpages');
        })

        it('should handle filtering (where) using a string', function() {
            this.dataSource
                .where("numberProperty lt 10")
                .load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$filter=numberProperty%20lt%2010');
        })

        it('should handle filtering (where) with parameters passed to where function', function() {
            this.dataSource
                .params({ aParam: 5 })
                .where(function(params) {
                    return "numberProperty lt " + params.aParam;
                })
                .load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$filter=numberProperty%20lt%205');
        })

        xit('should handle mapping', function() {
            this.dataSource.map(function(i) {
                return { mappedProperty: i.numberProperty };
            }).load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$select=numberProperty');
        })

        it('should handle orderBy', function() {
            this.dataSource.orderBy('numberProperty desc').load();

            expect(this.urlCalledWith).toEqual('/api/MyService?$orderby=numberProperty%20desc');
        })

        xit('should handle groupBy', function() {
            this.dataSource.groupBy('group').load();
        })

        describe('multiple-options', function() {
            it('skip and take', function() {
                this.dataSource.skip(3).take(5).load();

                expect(this.urlCalledWith).toEqual('/api/MyService?$take=5&$skip=3&$inlinecount=allpages');
            })

            it('filtering (where) and paging', function() {
                this.dataSource
                    .where("numberProperty lt 10")
                    .page(2).pageSize(5)
                    .load();

                expect(this.urlCalledWith).toEqual('/api/MyService?$filter=numberProperty%20lt%2010&$take=5&$skip=5&$inlinecount=allpages');
            })

            it('order by and paging', function() {
                this.dataSource.orderBy('numberProperty').page(2).pageSize(5).load();

                expect(this.urlCalledWith).toEqual('/api/MyService?$orderby=numberProperty&$take=5&$skip=5&$inlinecount=allpages');
            })

            xit('group by and paging', function() {
                this.dataSource
                    .groupBy('group')
                    .page(1)
                    .pageSize(2)
                    .load();
            })
        })
    })

    describe('result processing', function() {
        it('should handle plain array results', function() {
            var returnValue = [1, 423, 23, 546];

            expect(this.provider.processResult(returnValue)).toBe(returnValue);
        })

        it('should handle plain paged items results', function() {
            var returnValue = { totalCount: 4, items: [1, 423, 23, 546] };

            expect(this.provider.processResult(returnValue)).toBe(returnValue);
        })

        it('should handle V1 return with no page info', function() {
            var returnItems = [1, 51, 54, 45],
                returnValue = { d: returnItems };

            expect(this.provider.processResult(returnValue)).toBe(returnItems);
        })

        it('should handle V2 return with no page info', function() {
            var returnItems = [1, 51, 54, 45],
                returnValue = { d: { results: returnItems } };

            expect(this.provider.processResult(returnValue)).toBe(returnItems);
        })
    })
})