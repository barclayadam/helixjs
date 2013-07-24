describe('ui - navigation', function() {
    var router = hx.get('$router');

    beforeEach(function() {
        this.spy(router, 'navigateTo');  
        this.routePathStub = this.stub(hx.get('$location'), 'routePath');      
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
            router.route('My Page', '/my-page/{category}');
            router.route('My Other Page', '/my-other-page/{category}');
        });

        describe('parameters specified as static values', function() {
            beforeEach(function() {
                this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page', parameters: { category: 'a-category' }\">A Link</a>");
                this.applyBindingsToFixture({});
            })

            it('set href to constructed URL', function() {
                expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-page/a-category');
            })

            it('should navigate to the route on click', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

                expect(router.navigateTo).toHaveBeenCalledWith('My Page', { category: 'a-category' });
            })
        });

        describe('parameters specified as observable values', function() {
            beforeEach(function() {
                this.category = ko.observable('some-category');

                this.setHtmlFixture("<div>" +
                                    " <a id='my-page-link' data-bind=\"navigate: 'My Page', parameters: { category: category }\">A Link</a>" +
                                    " <a id='my-other-page-link' data-bind=\"navigate: 'My Other Page', parameters: { category: category }\">Another Link</a>" +
                                    "</div>");

                this.applyBindingsToFixture({
                    category: this.category
                });
            })

            it('set href to constructed URL', function() {
                expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-page/some-category');
            })

            it('should navigate to the route on click', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

                expect(router.navigateTo).toHaveBeenCalledWith('My Page', { category: this.category() });
            })

            it('should add active class when navigated', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

                expect(document.getElementById('my-page-link')).toHaveClass('active');
            })

            it('should remove active class when another route navigated', function() {
                ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');
                ko.utils.triggerEvent(document.getElementById('my-other-page-link'), 'click');

                expect(document.getElementById('my-page-link')).not.toHaveClass('active');
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

        it('should hide the link', function() {
            expect(document.getElementById('my-page-link')).toBeHidden();
        })
    })

    describe('authorised route components - isAuthorised updates observables async', function() {
        beforeEach(function() {
            var self = this;
            
            this.observableChangedDuringIsAuthorised = ko.observable();
            this.callCount = 0;

            this.component = { 
                isAuthorised: function(callback) {
                    self.callCount = self.callCount + 1;
                    self.observableChangedDuringIsAuthorised();
                }
            };

            this.spy(this.component.isAuthorised);

            router.route('My Page', '/my-page', { components: { 'main': this.component } });

            this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>");
            this.applyBindingsToFixture({});
        });

        it('should call isAuthorised only once', function() {
            this.observableChangedDuringIsAuthorised('a new value');

            expect(this.callCount).toBe(1);
        });
    });
})