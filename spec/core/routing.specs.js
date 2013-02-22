function itShouldReturnMatchedRoute(options) {
    describe("by " + options.name, function () {
        beforeEach(function () {
            this.matchedRoute = this.router.getRouteFromUrl(options.inputUrl);
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

describe('Routing:', function () {
    var $bus = hx.get('$bus');

    beforeEach(function () {
        this.router = new (hx.get('$RouteTable'));
    });

    describe('No routes defined', function () {
        describe('getting a route that does not exist (URL)', function () {
            beforeEach(function () {
                this.matchedRoute = this.router.getRouteFromUrl('/An unknown url');
            });

            it('should return undefined', function () {
                expect(this.matchedRoute).toBeUndefined;
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
                    url: '/404',
                    external: true
                });
            });

            it('should publish a routeNotFound message', function () {
                expect('routeNotFound').toHaveBeenPublishedWith({
                    url: '/404'
                });
            });
        });
    });

    describe('Single no-param route', function () {
        beforeEach(function () {
            this.routeNavigatedStub = this.stub();
            this.router.route('Contact Us', '/Contact Us', this.routeNavigatedStub);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        it('should default title of route to the name', function () {
            expect(this.contactUsRoute.title).toEqual('Contact Us');
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

            it('should call registered callback with parameters', function () {
                expect(this.routeNavigatedStub).toHaveBeenCalledWith({});
            });

            it('should publish a routeNavigated message', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {}
                });
            });

            it('should set currentRoute property', function () {
                expect(this.router.currentRoute).toBe(this.contactUsRoute);
            });

            it('should set currentParameters property to be empty', function () {
                expect(this.router.currentParameters).toEqual({});
            });
        });

        describe('URL changed externally to one matching route with query string params', function () {
            beforeEach(function () {
                 $bus.publish('urlChanged:external', {
                    url: '/Contact Us?name=My Name',
                    external: true
                });
            });

            it('should set currentParameters property to contain query string parameters', function () {
                expect(this.router.currentParameters).toEqual({
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
                    this.routePathStub = this.stub(hx.get('$location'), 'routePath');
                    this.router.navigateTo('Contact Us');
                });

                afterEach(function () {
                    document.title = this.currentTitle;
                });

                it('should use history manager to push a built URL', function () {
                    expect(this.routePathStub).toHaveBeenCalledWith('/Contact Us');
                });

                it('should call registered callback with parameters', function () {
                    expect(this.routeNavigatedStub).toHaveBeenCalledWith({});
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

                    this.routePathStub = this.stub(hx.get('$location'), 'routePath');

                    this.router.navigateTo('Contact Us');
                    this.router.navigateTo('Contact Us');
                });

                afterEach(function () {
                    document.title = this.currentTitle;
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
                expectedParameters: {},
                route: 'Contact Us'
            });

            itShouldReturnMatchedRoute({
                name: 'URL with different casing',
                inputUrl: '/CoNTact US/?key=prop',
                expectedParameters: {},
                route: 'Contact Us'
            });
        });
    });

    describe('Single no-param route, with object as callback', function () {
        beforeEach(function () {
            this.callbackOptions = {
                anOption: 'some text'
            };
            this.router.route('Contact Us', '/Contact Us', this.callbackOptions);
            this.contactUsRoute = this.router.getNamedRoute('Contact Us');
        });

        describe('navigateTo route', function () {
            beforeEach(function () {
                this.routePathStub = this.stub(hx.get('$location'), 'routePath');
                this.router.navigateTo('Contact Us');
            });

            it('should publish a routeNavigated message with options included', function () {
                expect("routeNavigated:Contact Us").toHaveBeenPublishedWith({
                    route: this.contactUsRoute,
                    parameters: {},
                    options: this.callbackOptions
                });
            });
        });
    });
    describe('Multiple, different, routes', function () {
        beforeEach(function () {
            this.contactUsRouteNavigatedStub = this.stub();
            this.aboutUsRouteNavigatedStub = this.stub();

            this.router.route('Contact Us', '/Contact Us', this.contactUsRouteNavigatedStub);
            this.router.route('About Us', '/About Us', this.aboutUsRouteNavigatedStub);

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

            it('should call registered callback with parameters', function () {
                expect(this.contactUsRouteNavigatedStub).toHaveBeenCalledWith({});
            });

            it('should not call registered callbacks of other routes', function () {
                expect(this.aboutUsRouteNavigatedStub).toHaveNotBeenCalled();
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
                    this.routePathStub = this.stub(hx.get('$location'), 'routePath');

                    this.router.navigateTo('Contact Us');
                    this.router.navigateTo('About Us');
                    this.router.navigateTo('Contact Us');
                });

                afterEach(function () {
                    document.title = this.currentTitle;
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

            it('should call registered callback with parameters', function () {
                expect(this.routeNavigatedStub).toHaveBeenCalledWith({
                    category: 'A Category'
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

            it('should set currentRoute property', function () {
                expect(this.router.currentRoute).toBe(this.contactUsRoute);
            });

            it('should set currentParameters property to contain route parameters', function () {
                expect(this.router.currentParameters).toEqual({
                    category: 'A Category'
                });
            });
        });

        describe('navigateTo route', function () {
            describe('twice consecutively with same parameters', function () {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.routePathStub = this.stub(hx.get('$location'), 'routePath');

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });
                });

                afterEach(function () {
                    document.title = this.currentTitle;
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

                it('should set currentRoute property', function () {
                    expect(this.router.currentRoute).toBe(this.contactUsRoute);
                });
                it('should set currentParameters property to contain route parameters', function () {
                    expect(this.router.currentParameters).toEqual({
                        category: 'A Category'
                    });
                });
            });
            describe('twice consecutively with different parameters', function () {
                beforeEach(function () {
                    this.routeNavigatedStub = this.stub();
                    $bus.subscribe('routeNavigated', this.routeNavigatedStub);

                    this.routePathStub = this.stub(hx.get('$location'), 'routePath');

                    this.router.navigateTo('Contact Us', {
                        category: 'A Category'
                    });

                    this.router.navigateTo('Contact Us', {
                        category: 'A Different Category'
                    });
                });

                afterEach(function () {
                     document.title = this.currentTitle;
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
                this.url = this.router.buildUrl('Contact Us', {
                    category: 'A Category'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.url).toEqual('/Contact Us/A Category');
            });
        });

        describe('creating a URL from the named route with observable values', function () {
            beforeEach(function () {
                this.url = this.router.buildUrl('Contact Us', {
                    category: ko.observable('A Category')
                });
            });

            it('should return the url with unwrapped parameter', function () {
                expect(this.url).toEqual('/Contact Us/A Category');
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
                    category: 'My Category'
                },
                route: 'Contact Us'
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
                this.url = this.router.buildUrl('Contact Us', {
                    category: 'A Category',
                    param2: 'A Value'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.url).toEqual('/Contact Us/A Category/A Value');
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
                    category: 'My Category'
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
                this.url = this.router.buildUrl('File', {
                    path: 'my/path/file.png'
                });
            });

            it('should return the url with parameter', function () {
                expect(this.url).toEqual('/File/my/path/file.png');
            });
        });

        describe('creating a URL from the named route with optional param missing', function () {
            beforeEach(function () {
                this.url = this.router.buildUrl('File', {});
            });

            it('should return the url with parameter', function () {
                expect(this.url).toEqual('/File/');
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
                    path: 'my/path/file.png'
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
});