describe('pager', function() {
    describe('individually provided observables', function() {
        beforeEach(function() {
            this.page = ko.observable(0);
            this.pageCount = ko.observable(0);

            this.setHtmlFixture(
                "<pager id='pager' data-option='{ pageCount: pageCount, page: page }'></pager>");

            this.applyBindingsToFixture({
                pageCount: this.pageCount,
                page: this.page
            });

            this.pager = document.getElementById('pager')
        })

        it('should add a hx-pager class to the element', function() {
            expect(this.pager).toHaveClass('hx-pager');
        })

        describe('with no pages', function() {
            it('should add no-pages class to the element', function() {
                expect(this.pager).toHaveClass('no-pages');
            })

            it('should render no links', function() {
                expect(document.getElementsByClassName('hx-pager--first')[0]).not.toExist();
                expect(document.getElementsByClassName('hx-pager--next')[0]).not.toExist();
                expect(document.getElementsByClassName('hx-pager--last')[0]).not.toExist();
                expect(document.getElementsByClassName('hx-pager--previous')[0]).not.toExist();
            })
        })

        describe('with a single page', function() {
            beforeEach(function() {
                this.pageCount(1);
                this.page(1);
            })

            it('should remove the no-pages class', function() {
                expect(this.pager).not.toHaveClass('no-pages')
            })

            it('should have first page link', function() {
                expect(document.getElementsByClassName('hx-pager--first')[0]).toExist();
            });

            it('should disable the first page link', function() {
                expect(document.getElementsByClassName('hx-pager--first')[0]).toHaveClass('disabled');
            });

            it('should have previous link', function() {
                expect(document.getElementsByClassName('hx-pager--previous')[0]).toExist();
            });

            it('should disable the previous link', function() {
                expect(document.getElementsByClassName('hx-pager--previous')[0]).toHaveClass('disabled');
            });

            it('should have a single page link', function() {
                expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(1);
            });

            it('should have a single page link that has is-selected class', function() {
                expect(document.getElementsByClassName('hx-pager--page-link')[0]).toHaveClass('is-selected');
            });

            it('should have next page link', function() {
                expect(document.getElementsByClassName('hx-pager--next')[0]).toExist();
            });

            it('should disable the next link', function() {
                expect(document.getElementsByClassName('hx-pager--next')[0]).toHaveClass('disabled');
            });

            it('should have last page link', function() {
                expect(document.getElementsByClassName('hx-pager--last')[0]).toExist();
            });

            it('should disable the last page link', function() {
                expect(document.getElementsByClassName('hx-pager--last')[0]).toHaveClass('disabled');
            });
        })

        describe('When bound to a paged data source with two pages', function () {
            beforeEach(function () {
                this.pageCount(2);
            })

            describe('When currently showing first page', function () {
                beforeEach(function () {
                    this.page(1);
                });

                it('should disable the first page link', function () {
                    expect(document.getElementsByClassName('hx-pager--first')[0]).toHaveClass('disabled');
                });

                it('should disable the previous link', function () {
                    expect(document.getElementsByClassName('hx-pager--previous')[0]).toHaveClass('disabled');
                });

                it('should have two page links', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(2);
                });

                it('should mark the first page as selected', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[0]).toHaveClass('is-selected');
                });

                it('should not mark the second page as selected', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[1]).not.toHaveClass('is-selected');
                });

                it('should enable the next link', function () {
                    expect(document.getElementsByClassName('hx-pager--next')[0]).not.toHaveClass('disabled');
                });

                it('should enable the last page link', function () {
                    expect(document.getElementsByClassName('hx-pager--last')[0]).not.toHaveClass('disabled');
                });

                it('should go to the last page when last page link clicked', function () {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-pager--last')[0], 'click')
                    expect(this.page()).toEqual(2);
                });

                it('should go to the last page when next page link clicked', function () {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-pager--next')[0], 'click');
                    expect(this.page()).toEqual(2);
                });
            });

            describe('When currently showing second page', function () {
                beforeEach(function () {
                    this.page(2);
                });

                it('should enable the first page link', function () {
                    expect(document.getElementsByClassName('hx-pager--first')[0]).not.toHaveClass('disabled');
                });

                it('should enable the previous link', function () {
                    expect(document.getElementsByClassName('hx-pager--previous')[0]).not.toHaveClass('disabled');
                });

                it('should have two page links', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(2);
                });

                it('should not mark the first page as selected', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[0]).not.toHaveClass('is-selected');
                });

                it('should mark the second page as selected', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[1]).toHaveClass('is-selected');
                });

                it('should disable the next link', function () {
                    expect(document.getElementsByClassName('hx-pager--next')[0]).toHaveClass('disabled');
                });

                it('should disable the last page link', function () {
                    expect(document.getElementsByClassName('hx-pager--last')[0]).toHaveClass('disabled');
                });

                it('should go to the first page when first page link clicked', function () {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-pager--first')[0], 'click');
                    expect(this.page()).toEqual(1);
                });

                it('should go to the first page when previous page link clicked', function () {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-pager--previous')[0], 'click');
                    expect(this.page()).toEqual(1);
                });
            });
        });

        describe('When bound to a paged data source with more pages (20) than a maximum (10)', function () {
            beforeEach(function () {
                this.pageCount(20)
            });

            describe('When currently showing first page', function () {
                beforeEach(function () {
                    this.page(1);
                });

                it('should have the first 10 pages shown only', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(10);
                });

                it('should start at page 1', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[0]).toHaveText('1');
                });

                it('should finish on page 10', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[9]).toHaveText('10');
                });
            });

            describe('When currently showing last page', function () {
                beforeEach(function () {
                    this.page(20);
                });

                it('should have the last ten pages shown only', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(10);
                });

                it('should start at page 11', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[0]).toHaveText('11');
                });

                it('should finish on page 20', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[9]).toHaveText('20');
                });
            });

            describe('When currently showing mid-way page', function () {
                beforeEach(function () {
                    this.page(10);
                });

                it('should have ten pages shown only', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(10);
                });

                it('should start at page 5', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[0]).toHaveText('5');
                });

                it('should finish on page 14', function () {
                    expect(document.getElementsByClassName('hx-pager--page-link')[9]).toHaveText('14');
                });
            });
        })
    });

    describe('bound to a non-paged dataView', function() {
        beforeEach(function() {            
            this.dataView = hx.get('$DataView')
                              .from(ko.observable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
                              .load();

            this.setHtmlFixture(
                "<pager id='pager' data-option='dataView'></pager>");

            this.applyBindingsToFixture({
                dataView: this.dataView
            });

            this.pager = document.getElementById('pager')
        })

        it('should not render any pages', function () {
            expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(0);
        });
    });

    describe('bound to a paged dataView', function() {
        beforeEach(function() {            
            this.dataView = hx.get('$DataView')
                              .from(ko.observable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))
                              .pageSize(5);

            this.setHtmlFixture(
                "<pager id='pager' data-option='dataView'></pager>");

            this.applyBindingsToFixture({
                dataView: this.dataView
            });

            this.pager = document.getElementById('pager')
        })

        describe('that has not been loaded', function() {
            it('should not render any pages', function () {
                expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(0);
            });
        });

        describe('that has been loaded', function() {
            beforeEach(function() {
                this.dataView.load();
            })

            it('should correctly show number of pages', function () {
                expect(document.getElementsByClassName('hx-pager--page-link').length).toEqual(2);
            });

            it('should change page in dataView when clicking a page link', function () {
                expect(this.dataView.page()).toEqual(1);
                ko.utils.triggerEvent(document.getElementsByClassName('hx-pager--page-link')[1], 'click');
                expect(this.dataView.page()).toEqual(2);
            });
        });
    });

    describe('overriding template parts', function() {
        beforeEach(function() {
            this.page = ko.observable(1);
            this.pageCount = ko.observable(1);

            this.setHtmlFixture(
                "<pager id='pager' data-option='{ pageCount: pageCount, page: page }'>" +
                "  <part id='backward-links'>" +
                "    <span id='overriden-backward-links' data-bind='text: page'>Some text<span>" +
                "  </part>" +
                "  <part id='page-links'>" +
                "    <span id='overriden-page-links'>Some text<span>" +
                "  </part>" +
                "  <part id='forward-links'>" +
                "    <span id='overriden-forward-links'>Some text<span>" +
                "  </part>" +
                "</pager>"
                );

            this.applyBindingsToFixture({
                pageCount: this.pageCount,
                page: this.page
            });

            this.pager = document.getElementById('pager')
        })

        it('should allow overriding backward-links', function() {
            expect(document.getElementById('overriden-backward-links')).toExist()
        })

        it('should have pager model as binding context $data', function() {
            expect(document.getElementById('overriden-backward-links')).toHaveText('1')
        })

        it('should allow overriding page-links', function() {
            expect(document.getElementById('overriden-page-links')).toExist()
        })

        it('should allow overriding forward-links', function() {
            expect(document.getElementById('overriden-forward-links')).toExist()
        })

        it('should support updating of values to re-render overriden part', function() {
            this.page(5);
            expect(document.getElementById('overriden-backward-links')).toHaveText('5')
        })
    })
})