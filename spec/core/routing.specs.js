function itShouldReturnMatchedRoute(options) {
    describe("by " + options.name, function () {
        beforeEach(function () {
            this.matchedRoute = this.router.getMatchedRouteFromUrl(options.inputUrl);
        });

        it('should return the matched route data', function () {
            expect(this.matchedRoute).toBeDefined;
        });

        it('should have route populated as expected', function () {
            expect(this.matchedRoute.route.name).toEqual(options.route);
        });

        it('should have parameters populated as expected', function () {
            expect(this.matchedRoute.parameters).toEqual(options.expectedParameters);
        });
    });
};

describe('routing', function () {
    var $bus = hx.get('$bus');

    beforeEach(function () {
        this.router = new (hx.get('$RouteTable'));
        this.routePathStub = this.stub(hx.get('$location'), 'routePath');
    });

    describe('No routes defined', function () {
        describe('getting a route that does not exist (URL)', function () {
            beforeEach(function () {
                this.matchedRoute = this.router.getMatchedRouteFromUrl('/An unknown url');
            });

            it('should return undefined', function () {
                expect(this.matchedRoute).toBeUndefined();
            });
        });

        describe('getting a route that does not exist (name)', function () {
            beforeEach(function () {
                this.route = this.router.getNamedRoute('Unknown Route');
            });

            it('should return undefined', function () {
                expect(this.route).toBeUndefined();
            });
        });

        describe('URL changed by user', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/PageDoesNotExist',
                    external: true
                });
            });

            it('should publish a routeNotFound message', function () {
                expect('routeNotFound').toHaveBeenPublishedWith({
                    url: '/PageDoesNotExist'
                });
            });
        });
    });

    describe('Single no-param route', function () {
        beforeEach(function () {
            this.contactUsOptions = { anOptions: 'A Value' };
            this.router.route('Contact Us', '/Contact Us', this.contactUsOptions);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('getting the route by name', function () {
            beforeEach(function () {
                this.route = this.router.getNamedRoute('Contact Us');
            });

            it('should return the route', function () {
                expect(this.route).toBeDefined();
                expect(this.route.name).toBe('Contact Us');
            });
        });

        describe('URL changed externally to one matching route', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/Contact Us',
                    external: true
                });
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {}
                });
            });

            it('should set currentRoute property', function () {
                expect(this.router.current().route).toBe(this.contactUsRoute);
            });

            it('should set current.parameters property to be empty', function () {
                expect(this.router.current().parameters).toEqual({});
            });
        });

        describe('URL changed externally to one matching route with query string params', function () {
            beforeEach(function () {
                 $bus.publish('urlChanged:external', {
                    url: '/Contact Us?name=My Name',
                    external: true
                });
            });

            it('should set current.parameters property to contain query string parameters', function () {
                expect(this.router.current().parameters).toEqual({
                    name: 'My Name'
                });
            });
        });

        describe('URL changed by user to not match URL', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/Some URL That Does Not Exist',
                    external: true
                });
            });

            it('should publish a routeNotFound message', function () {
                expect('routeNotFound').toHaveBeenPublishedWith({
                    url: '/Some URL That Does Not Exist'
                });
            });
        });

        describe('navigateTo route', function () {
            describe('once', function () {
                beforeEach(function () {
                    this.router.navigateTo('Contact Us');
                });

                it('should use history manager to push a built URL', function () {
                    expect(this.routePathStub).toHaveBeenCalledWith('/Contact Us');
                });

                it('should publish a routeNavigated message', function () {
                    expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                        route: this.contactUsRoute,
                        parameters: {}
                    });
                });
            });

            describe('twice consecutively', function () {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();                    
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.router.navigateTo('Contact Us');
                    this.router.navigateTo('Contact Us');
                });

                it('should change location.routePath twice', function () {
                    expect(this.routePathStub).toHaveBeenCalledTwice();
                });

                it('should call registered callback with parameters again', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });

                it('should publish a routeNavigated message twice', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL with no query string',
                inputUrl: '/Contact Us',
                expectedParameters: {},
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'exact match encoded URL',
                inputUrl: '/Contact%20Us',
                expectedParameters: {},
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'relative URL with missing slash at start',
                inputUrl: 'Contact Us/',
                expectedParameters: {},
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with query string parameters',
                inputUrl: '/Contact Us/?key=prop',
                expectedParameters: { key: 'prop' },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with different casing',
                inputUrl: '/CoNTact US/?key=prop',
                expectedParameters: { key: 'prop' },
                route: 'Contact Us'
            });
        });
    });

    describe('Single no-param route, with options', function () {
        beforeEach(function () {
            this.options = {
                anOption: 'some text'
            };
            this.router.route('Contact Us', '/Contact Us', this.options);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('navigateTo route', function () {
            beforeEach(function () {
                this.router.navigateTo('Contact Us');
            });

            it('should publish a routeNavigated message with options included', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {}
                });
            });
        });
    });

    describe('Single no-param route, with callback instead of options', function () {
        beforeEach(function () {
            this.callback = this.stub();
            this.router.route('Contact Us', '/Contact Us', this.callback);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('navigateTo route', function () {
            beforeEach(function () {
                this.router.navigateTo('Contact Us');
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {}
                });
            });

            it('should execute callback with empty parameters object', function () {
                expect(this.callback).toHaveBeenCalledWith({});
            });
        });

        describe('callback returns false', function () {
            beforeEach(function () {
                this.callback.returns(false);
                this.router.navigateTo('Contact Us');
            });

            it('should not publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").not.toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: { category: 'A Category' }
                });
            });

            it('should not change $location.routePath', function() {
                expect(this.routePathStub).not.toHaveBeenCalledWith();

            })
        });
    });

    describe('Multiple, different, routes', function () {
        beforeEach(function () {
            this.contactUsOptions = {};
            this.aboutUsOptions = {};

            this.router.route('Contact Us', '/Contact Us', this.contactUsOptions);
            this.router.route('About Us', '/About Us', this.aboutUsOptions);

            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
            this.aboutUsRoute = this.router.getNamedRoute('About Us');
        });

        describe('URL changed externally to one matching route', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/Contact Us',
                    external: true
                });
            });

            it('should not call registered callbacks of other routes', function () {
                expect("routeNavigated:About Us").toHaveNotBeenPublished();
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {}
                });
            });
        });

        describe('URL changed by user to not match URL', function () {
            beforeEach(function () {
                 $bus.publish('urlChanged:external', {
                    url: '/Some URL That Does Not Exist',
                    external: true
                });
            });

            it('should publish a routeNavigated message', function () {
                expect('routeNotFound').toHaveBeenPublishedWith({
                    url: '/Some URL That Does Not Exist'
                });
            });
        });

        describe('navigateTo route', function () {
            describe('switch between two routes', function () {
                beforeEach(function () {
                    this.router.navigateTo('Contact Us');
                    this.router.navigateTo('About Us');
                    this.router.navigateTo('Contact Us');
                });

                it('should change location.routePath all three times', function () {
                    expect(this.routePathStub).toHaveBeenCalledWith('/Contact Us');
                    expect(this.routePathStub).toHaveBeenCalledWith('/About Us');
                    expect(this.routePathStub).toHaveBeenCalledThrice();
                });

                it('should publish routeNavigated messages', function () {
                    expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                        route: this.contactUsRoute,
                        parameters: {}
                    });

                    expect("routeNavigated:About Us").toHaveBeenPublishedWith({
                        route: this.aboutUsRoute,
                        parameters: {}
                    });
                });
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL for first route',
                inputUrl: '/Contact Us',
                expectedParameters: {},
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'exact match URL for second route',
                inputUrl: '/About Us',
                expectedParameters: {},
                route: 'About Us'
            });
        });
    });

    describe('Multiple routes that match the same URL', function () {
        beforeEach(function () {
            this.router.route('Contact Us', '/Contact Us');
            this.router.route('Contact Us 2', '/Contact Us');

            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
            this.contactUs2Route = this.router.getNamedRoute('Contact Us 2');
        });

        describe('URL changed externally to one matching route', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/Contact Us',
                    external: true
                });
            });

            it('should publish a routeNavigated message for last registered route', function () {
                expect("routeNavigated:Contact Us 2").toHaveBeenPublishedWith({
                    route: this.contactUs2Route,
                    parameters: {}
                });
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL to match last route registered',
                inputUrl: '/Contact Us',
                expectedParameters: {},
                route: 'Contact Us 2'
            });
        });
    });

    describe('Single one-param route', function () {
        beforeEach(function () {
            this.routeNavigatedStub = this.stub();
            this.router.route('Contact Us', '/Contact Us/{category}', this.routeNavigatedStub);

            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('URL changed externally to one matching route', function () {
            beforeEach(function () {
                $bus.publish('urlChanged:external', {
                    url: '/Contact Us/A Category',
                    external: true
                });
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {
                        category: 'A Category'
                    }
                });
            });

            it('should set current.route property', function () {
                expect(this.router.current().route).toBe(this.contactUsRoute);
            });

            it('should set current.parameters property to contain route parameters', function () {
                expect(this.router.current().parameters).toEqual({
                    category: 'A Category'
                });
            });
        });

        describe('navigateTo route', function () {
            describe('with observable parameters passed', function() {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.router.navigateTo('Contact Us', {
                        category: ko.observable('A Category')
                    });
                });

                it('should set current.parameters property to contain unwrapped route parameters', function () {
                    expect(this.router.current().parameters).toEqual({
                        category: 'A Category'
                    });
                });

            })

            describe('twice consecutively with same parameters', function () {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });
                });

                it('should change routePath twice', function () {
                    expect(this.routePathStub).toHaveBeenCalledTwice();
                });

                it('should call registered callback with parameters twice', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });

                it('should publish a routeNavigated message twice', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });

                it('should set current.route property', function () {
                    expect(this.router.current().route).toBe(this.contactUsRoute);
                });

                it('should set current.parameters property to contain route parameters', function () {
                    expect(this.router.current().parameters).toEqual({
                        category: 'A Category'
                    });
                });
            });
            describe('twice consecutively with different parameters', function () {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });

                    this.router.navigateTo('Contact Us', {
                        category: 'A Different Category'
                    });
                });

                it('should change routePath twice', function () {
                    expect(this.routePathStub).toHaveBeenCalledTwice();
                });

                it('should call registered callback with parameters twice', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });

                it('should publish a routeNavigated message twice', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledTwice();
                });
            });
        });

        describe('creating a URL from the named route', function () {
            beforeEach(function () {
                this.match = this.router.buildMatchedRoute('Contact Us', {
                    category: 'A Category'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.match.url).toEqual('/Contact Us/A Category');
            });
        });

        describe('creating a URL from the named route with observable values', function () {
            beforeEach(function () {
                this.match = this.router.buildMatchedRoute('Contact Us', {
                    category: ko.observable('A Category')
                });
            });

            it('should return the url with unwrapped parameter', function () {
                expect(this.match.url).toEqual('/Contact Us/A Category');
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL with no query string',
                inputUrl: '/Contact Us/My Category',
                expectedParameters: {
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'extra trailing slash and no query string',
                inputUrl: '/Contact Us/My Category/',
                expectedParameters: {
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'exact match encoded URL',
                inputUrl: '/Contact%20Us/My%20Category',
                expectedParameters: {
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'relative URL with missing slash at start',
                inputUrl: 'Contact Us/My Category',
                expectedParameters: {
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with query string parameters',
                inputUrl: '/Contact Us/My Category?key=prop',
                expectedParameters: {
                    category: 'My Category',
                    key: 'prop'
                },
                route: 'Contact Us'
            });
        });
    });

    describe('Single one-param route, with callback instead of options', function () {
        beforeEach(function () {
            this.callback = this.spy();
            this.router.route('Contact Us', '/Contact Us/{category}', this.callback);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('navigateTo route', function () {
            beforeEach(function () {
                this.router.navigateTo('Contact Us', {
                    category: 'A Category'
                });
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: { category: 'A Category' }
                });
            });

            it('should execute callback with populated parameters object', function () {
                expect(this.callback).toHaveBeenCalledWith({ category: 'A Category' });
            });
        });
    });

    describe('Single two-param route', function () {
        beforeEach(function () {
            this.router.route('Contact Us', '/Contact Us/{category}/{param2}');
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('creating a URL from the named route', function () {
            beforeEach(function () {
                this.match = this.router.buildMatchedRoute('Contact Us', {
                    category: 'A Category',
                    param2: 'A Value'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.match.url).toEqual('/Contact Us/A Category/A Value');
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL with no query string',
                inputUrl: '/Contact Us/My Category/Other',
                expectedParameters: {
                    param2: 'Other',
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'extra trailing slash and no query string',
                inputUrl: '/Contact Us/My Category/Other/',
                expectedParameters: {
                    param2: 'Other',
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'exact match encoded URL',
                inputUrl: '/Contact%20Us/My%20Category/Other',
                expectedParameters: {
                    param2: 'Other',
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'relative URL with missing slash at start',
                inputUrl: 'Contact Us/My Category/Other',
                expectedParameters: {
                    param2: 'Other',
                    category: 'My Category'
                },
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with query string parameters',
                inputUrl: '/Contact Us/My Category/Other?key=prop',
                expectedParameters: {
                    param2: 'Other',
                    category: 'My Category',
                    key: 'prop'
                },
                route: 'Contact Us'
            });
        });
    });

    describe('Single one-param catch-all route', function () {
        beforeEach(function () {
            this.router.route('File', '/File/{*path}');
            this.fileRoute = this.router.getNamedRoute('File');
        });

        describe('creating a URL from the named route', function () {
            beforeEach(function () {
                this.match = this.router.buildMatchedRoute('File', {
                    path: 'my/path/file.png'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.match.url).toEqual('/File/my/path/file.png');
            });
        });

        describe('creating a URL from the named route with optional param missing', function () {
            beforeEach(function () {
                this.match = this.router.buildMatchedRoute('File', {});
            });

            it('should return the url with parameter', function () {
                expect(this.match.url).toEqual('/File/');
            });
        });

        describe('getting route from URL', function () {
            itShouldReturnMatchedRoute({
                name: 'exact match URL with no query string',
                inputUrl: '/File/my/path/file.png',
                expectedParameters: {
                    path: 'my/path/file.png'
                },
                route: 'File'
            });

            itShouldReturnMatchedRoute({
                name: 'extra trailing slash and no query string',
                inputUrl: '/File/my/path/file.png/',
                expectedParameters: {
                    path: 'my/path/file.png/'
                },
                route: 'File'
            });

            itShouldReturnMatchedRoute({
                name: 'exact match encoded URL',
                inputUrl: '/File/my/path/my%20file.png',
                expectedParameters: {
                    path: 'my/path/my file.png'
                },
                route: 'File'
            });

            itShouldReturnMatchedRoute({
                name: 'relative URL with missing slash at start',
                inputUrl: 'File/my/path/file.png',
                expectedParameters: {
                    path: 'my/path/file.png'
                },
                route: 'File'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with query string parameters',
                inputUrl: '/File/my/path/file.png?key=prop',
                expectedParameters: {
                    path: 'my/path/file.png',
                    key: 'prop'
                },
                route: 'File'
            });
            
            itShouldReturnMatchedRoute({
                name: 'Missing optional parameter',
                inputUrl: '/File/',
                expectedParameters: {
                    path: ''
                },
                route: 'File'
            });
        });
    });

    describe('Authorisation', function() {
        beforeEach(function () {
            this.authComponent = { isAuthorised: this.stub() };

            this.router.route('AuthRoute', '/auth-route', { components: { main: this.authComponent } });
        });

        it('should call isAuthorised of created component when calling matchedRoute.authorise', function() {
            var matchedRoute = this.router.buildMatchedRoute('AuthRoute', {});
            matchedRoute.authorise();

            expect(this.authComponent.isAuthorised).toHaveBeenCalled();
        })

        it('should authorise component on navigation', function() {
            this.router.navigateTo('AuthRoute', {});

            expect(this.authComponent.isAuthorised).toHaveBeenCalled();
        })

        it('should should publish an unauthorised message when authorisation fails', function() {
            this.authComponent.isAuthorised.returns(false);

            this.router.navigateTo('AuthRoute', {});

            expect('unauthorisedRoute:AuthRoute').toHaveBeenPublishedWith({ 
                route: this.router.getNamedRoute('AuthRoute'), 
                parameters: {}
            });
        })

        it('should should not update $location.routePath when authorisation fails', function() {
            this.authComponent.isAuthorised.returns(false);

            this.router.navigateTo('AuthRoute', {});

            expect(this.routePathStub).toHaveNotBeenCalled();
        })
    })
});