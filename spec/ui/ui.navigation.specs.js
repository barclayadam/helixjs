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
            router.route({ name: 'My Page', url: '/my-page' });

            this.setHtmlFixture(
                "<a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>" +
                "<a data-bind=\"navigate: 'My Page'\"><span id=inner-link-element>Another Link</span></a>"
                );
            this.applyBindingsToFixture({});
        })

        it('set href to constructed URL', function() {
            expect(document.getElementById('my-page-link')).toHaveAttr('href', '/my-page');
        })

        it('should navigate to the route on click', function() {
            ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

            expect(router.navigateTo).toHaveBeenCalledWith('My Page', {});
        })

        it('should navigate to the route on click of inner element', function() {
            ko.utils.triggerEvent(document.getElementById('inner-link-element'), 'click');

            expect(router.navigateTo).toHaveBeenCalledWith('My Page', {});
        })
    })

    describe('route with required parameters', function() {
        beforeEach(function() {
            router.route({ name: 'My Page', url: '/my-page/{category}' });
            router.route({ name: 'My Other Page', url: '/my-other-page/{category}' });
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
        });
    })

    describe('active route classes', function() {
        beforeEach(function() {
            router.route({ name: 'My Page', url: '/my-page/' });
            router.route({ name: 'My Sub Page', url: '/my-page/sub-page' });
            router.route({ name: 'My Other Page', url: '/my-other-page/' });

            this.category = ko.observable('some-category');

            this.setHtmlFixture("<div>" +
                                " <a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>" +    
                                " <a id='my-sub-page-link' data-bind=\"navigate: 'My Sub Page'\">A Sub Link</a>" +                                     
                                " <a id='my-other-page-link' data-bind=\"navigate: 'My Other Page'\">Another Link</a>" +
                                "</div>");


            router.navigateTo('My Other Page');

            this.applyBindingsToFixture({
                category: this.category
            });

        })

        it('should add nav-active class if route is already active', function() {
            expect(document.getElementById('my-other-page-link')).toHaveClass('nav-active');
        })

        it('should add nav-active class when navigated', function() {
            ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');

            expect(document.getElementById('my-page-link')).toHaveClass('nav-active');
        })

        it('should add sub-nav-active class when route url begins with same as nav', function() {
            ko.utils.triggerEvent(document.getElementById('my-sub-page-link'), 'click');

            expect(document.getElementById('my-page-link')).toHaveClass('sub-nav-active');
        })

        it('should remove nav-active class when another route navigated', function() {
            ko.utils.triggerEvent(document.getElementById('my-page-link'), 'click');
            ko.utils.triggerEvent(document.getElementById('my-other-page-link'), 'click');

            expect(document.getElementById('my-page-link')).not.toHaveClass('nav-active');
        })

    })

    describe('authorised route components - failing authorisation', function() {
        beforeEach(function() {
            this.component = { isAuthorised: this.stub().returns(false) };

            router.route({ name: 'My Page', url: '/my-page', component: this.component });

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

            router.route({ name: 'My Page', url: '/my-page', component: this.component });

            this.setHtmlFixture("<a id='my-page-link' data-bind=\"navigate: 'My Page'\">A Link</a>");
            this.applyBindingsToFixture({});
        });

        it('should call isAuthorised only once', function() {
            this.observableChangedDuringIsAuthorised('a new value');

            expect(this.callCount).toBe(1);
        });
    });
})