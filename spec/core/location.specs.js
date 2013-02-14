var testHistoryPolyfill = false;

describe('location', function () {
    beforeEach(function () {
        this.currentLocation = window.location.pathname;
        this.currentTitle = document.title;
    });

    afterEach(function () {
        window.history.replaceState({}, this.currentTitle, this.currentLocation);
    });

    if (testHistoryPolyfill) {
        describe('polyfill', function () {
            describe('pushState and replaceState polyfill', function () {
                it('should have history.pushState available', function () {
                    expect(window.history.pushState).toBeAFunction();
                });

                it('should have history.replaceState available', function () {
                    expect(window.history.replaceState).toBeAFunction();
                });

                describe('pushState', function () {
                    beforeEach(function () {
                        window.history.pushState({}, 'New Title', 'MyNewUrl');
                    });

                    it('should set document.title to supplied title', function () {
                        expect(document.title).toEqual('New Title');
                    });

                    it('should change URL (in some way) to include the new URL', function () {
                        expect(window.location.toString()).toContain('MyNewUrl');
                    });

                    it('should return the new URL from routePath, with a preceeding slash', function () {
                        expect(hx.location.routePath()).toContain('/MyNewUrl');
                    });

                    describe('when going back', function () {
                        beforeEach(function () {
                            runs(function () {
                                this.popstateSpy = this.spy();
                                ko.utils.registerEventHandler(window, "popstate", this.popstateSpy);
                                window.history.go(-1);
                            });

                            waits(400);
                        });

                        it('should raise a popstate event', function () {
                            expect(this.popstateSpy).toHaveBeenCalledOnce();
                        });

                        it('should return to URL as was at time of pushState', function () {
                            expect(window.location.pathname).toEqual(this.currentLocation);
                        });
                    });
                });

                describe('replaceState', function () {
                    beforeEach(function () {
                        window.history.replaceState({}, 'New Title', 'MyNewUrl');
                    });

                    it('should set document.title to supplied title', function () {
                        expect(document.title).toEqual('New Title');
                    });

                    it('should change URL (in some way) to include the new URL', function () {
                        expect(window.location.toString()).toContain('MyNewUrl');
                    });

                    it('should return the new URL from routePath, with a preceeding slash', function () {
                        expect(hx.location.routePath()).toContain('/MyNewUrl');
                    });

                    describe('when going back', function () {
                        beforeEach(function () {
                            window.history.pushState({}, 'New Title', 'MyOtherPushUrl');
                            window.history.replaceState({}, 'New Title', 'MyOtherReplaceUrl');

                            runs(function () {
                                this.popstateSpy = this.spy();
                                ko.utils.registerEventHandler(window, "popstate", this.popstateSpy);
                                window.history.go(-1);
                            });

                            waits(400);
                        });

                        it('should raise a popstate event', function () {
                            expect(this.popstateSpy).toHaveBeenCalledOnce();
                        });

                        it('should return to URL previously stored before replaceState', function () {
                            expect(window.location.toString()).toContain('MyNewUrl');
                        });
                    });
                });
            });
        });
    }

    beforeEach(function () {
        hx.location.reset();
    });

    describe('uri observables', function () {
        it('should have populated uri observable from current URL', function () {
            expect(hx.location.uri).toBeObservable();
            expect(hx.location.uri().toString()).toContain('http://localhost');
            expect(hx.location.uri().toString()).toContain('runner.html');
        });

        it('should have populated host property from current URL', function () {
            expect(hx.location.host()).toEqual('localhost');
        });

        it('should have populated fragment observable from current URL', function () {
            expect(hx.location.fragment).toBeObservable();
            expect(hx.location.fragment()).toEqual(hx.location.uri().fragment);
        });

        it('should have populated path observable from current URL', function () {
            expect(hx.location.path).toBeObservable();
            expect(hx.location.path()).toContain('runner.html');
        });

        it('should have populated variables observable from current URL', function () {
            expect(hx.location.variables).toBeObservable();
            expect(hx.location.variables()).toEqual({});
        });

        it('should have populated query observable from current URL', function () {
            expect(hx.location.query).toBeObservable();
            expect(hx.location.query()).toEqual('');
        });
    });

    describe('and the URL changes through user action', function () {
        beforeEach(function () {
            window.history.pushState(null, null, '/My New Url?key=value');
            ko.utils.triggerEvent(window, 'popstate');
            hx.location.initialise();
        });

        it('should publish a urlChanged:external with current fragment and external=true', function () {
            expect('urlChanged:external').toHaveBeenPublished();
            expect('urlChanged:external').toHaveBeenPublishedWith({
                url: '/My New Url?key=value',
                path: '/My New Url',
                variables: {
                    key: 'value'
                },
                external: true
            });
        });

        it('should update the uri observable', function () {
            expect(hx.location.uri().toString()).toContain('/My New Url');
        });

        it('should update the routePath observable', function () {
            expect(hx.location.routePath()).toEqual('/My New Url');
        });

        it('should decode the routePath observable\'s value', function () {
            expect(hx.location.routePath()).toEqual('/My New Url');
        });
    });
    describe('setting URL', function () {
        describe('when changing the path to a new value', function () {
            beforeEach(function () {
                this.pushStateSpy = this.spy(window.history, 'pushState');
                hx.location.routePath('/Timesheets/Manage');
            });

            it('should use pushState to modify the URL', function () {
                expect(this.pushStateSpy).toHaveBeenCalledWith(null, document.title, '/Timesheets/Manage');
            });

            it('should publish a urlChanged:internal message with current fragment and external=false', function () {
                expect('urlChanged:internal').toHaveBeenPublished();
                expect('urlChanged:internal').toHaveBeenPublishedWith({
                    url: '/Timesheets/Manage',
                    path: '/Timesheets/Manage',
                    variables: {},
                    external: false
                });
            });

            it('should update the uri observable', function () {
                expect(hx.location.uri().toString()).toContain('/Timesheets/Manage');
            });

            it('should update the routePath observable', function () {
                expect(hx.location.routePath()).toEqual('/Timesheets/Manage');
            });
        });

        describe('when passing the same URL', function () {
            beforeEach(function () {
                this.pushStateSpy = this.spy(window.history, 'pushState');
                this.urlChangedMessageHandler = this.spy();

                hx.bus.subscribe('urlChanged:internal', this.urlChangedMessageHandler);

                hx.location.routePath('/Users/Manage');
                hx.location.routePath('/Users/Manage');
            });

            it('should not push a new entry', function () {
                expect(this.pushStateSpy).toHaveBeenCalledOnce();
            });

            it('should not publish a urlChanged:internal message', function () {
                expect(this.urlChangedMessageHandler).toHaveBeenCalledOnce();
            });
        });        
    });

    describe('setting state', function () {
        describe('when setting bookmarkable, history creating, key to a new value', function () {
            beforeEach(function () {
                this.pushStateSpy = this.spy(window.history, "pushState");
                this.currentRoutePath = hx.location.routePath();
                this.key = 'My Key';
                this.value = 'Value' + (new Date()).getTime();

                hx.location.routeVariables.set(this.key, this.value, {
                    history: true
                });
            });

            it('should change URL to include key and value', function () {
                expect(decodeURIComponent(hx.location.uri().toString())).toContain("" + this.key + "=" + this.value);
            });

            it('should update variables observable to contain new value', function () {
                expect(hx.location.routeVariables()[this.key]).toEqual(this.value);
            });

            it('should push a new history entry', function () {
                expect(this.pushStateSpy).toHaveBeenCalledOnce();
            });

            it('should not change the routePath observable', function () {
                expect(hx.location.routePath()).toEqual(this.currentRoutePath);
            });
        });

        describe('when setting bookmarkable, non history creating, key to a new value', function () {
            beforeEach(function () {
                this.replaceStateSpy = this.spy(window.history, "replaceState");
                this.currentRoutePath = hx.location.routePath();
                this.key = 'My Key';
                this.value = 'Value' + (new Date()).getTime();
                
                hx.location.routeVariables.set(this.key, this.value, {
                    history: false
                });
            });

            it('should change URL to include key and value', function () {
                expect(decodeURIComponent(hx.location.uri().toString())).toContain("" + this.key + "=" + this.value);
            });

            it('should update variables observable to contain new value', function () {
                expect(hx.location.routeVariables()[this.key]).toEqual(this.value);
            });

            it('should not push a new history entry', function () {
                expect(this.replaceStateSpy).toHaveBeenCalledOnce();
            });

            it('should not change the routePath observable', function () {
                expect(hx.location.routePath()).toEqual(this.currentRoutePath);
            });
        });
    });
});