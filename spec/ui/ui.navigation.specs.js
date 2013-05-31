describe('ui - navigation', function() {
    var router = hx.get('$router');

    beforeEach(function() {
        this.stub(router, 'navigateTo');        
    })

    describe('missing route', function() {
        beforeEach(function() {

            this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'A route that does not exist'\">A Link</a>");
            this.applyBindingsToFixture({});
        })

        it('set href to hash symbol (#)', function() {
            expect(document.getElementById('my-page-link')).toHaveAttr('href', '#');
        })
    })

    describe('route with no parameters', function() {
        beforeEach(function() {
            router.route('My Page', '/my-page');

            this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>");
            this.applyBindingsToFixture({});
        })

        it('set href to constructed URL', function() {
            expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-page');
        })

        it('should navigate to the route on click', function() {
            ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

            expect(router.navigateTo).toHaveBeenCalledWith('My Page', {});
        })
    })

    describe('route with required parameters', function() {
        beforeEach(function() {
            router.route('My Page', '/my-other-page/{category}');
        });

        describe('parameters specified as static values', function() {
            beforeEach(function() {
                this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page', parameters: { category: 'a-category' }\">A Link</a>");
                this.applyBindingsToFixture({});
            })

            it('set href to constructed URL', function() {
                expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-other-page/a-category');
            })

            it('should navigate to the route on click', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

                expect(router.navigateTo).toHaveBeenCalledWith('My Page', { category: 'a-category' });
            })
        });

        describe('parameters specified as observable values', function() {
            beforeEach(function() {
                this.category = ko.observable('some-category');

                this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page', parameters: { category: category }\">A Link</a>");

                this.applyBindingsToFixture({
                    category: this.category
                });
            })

            it('set href to constructed URL', function() {
                expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-other-page/some-category');
            })

            it('should navigate to the route on click', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

                expect(router.navigateTo).toHaveBeenCalledWith('My Page', { category: this.category() });
            })
        });
    })

    describe('authorised route components - failing authorisation', function() {
        beforeEach(function() {
            this.component = { isAuthorised: this.stub().returns(false) };

            router.route('My Page', '/my-page', { components: { 'main': this.component } });

            this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>");
            this.applyBindingsToFixture({});
        });

        it('set hide the link', function() {
            expect(document.getElementById('my-page-link')).toBeHidden();
        })
    })
})