describe('component binding handler', function () {
    var $templating = hx.get('$templating'),
        $ajax = hx.get('$ajax'),
        $router = hx.get('$router');

    describe('binding undefined view model', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\">\n    This is an anonymous template\n</div>");

            this.applyBindingsToFixture({ viewModel: undefined });
        });

        it('should render no children', function () { 
            expect(document.getElementById("fixture")).toBeEmpty()
        });
    });

    describe('binding a plain object with anonymous template', function () {
        beforeEach(function () {
            this.viewModel = ko.observable({
                aProperty: 'A Property',
                anObservableProperty: ko.observable('An observable property')
            });

            ko.bindingHandlers.test1 = {
                init: this.spy(),

                update: this.spy(function (element, valueAccessor) {
                    ko.utils.unwrapObservable(valueAccessor()); // Ensure a subscription exists
                })
            };

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\">\n    This is an anonymous template\n\n    <span data-bind=\"test1: anObservableProperty\"></span>\n</div>");
            this.applyBindingsToFixture({
                viewModel: this.viewModel
            });

            this.wrapper = document.getElementById("fixture");
        });

        it('should set view model as context when rendering template', function () {
            // Just check that when binding directly to a property of the view model 
            // binding handlers are getting called with it (a little brittle!)
            expect(ko.bindingHandlers.test1.init.args[0][1]()).toBe(this.viewModel().anObservableProperty);
        });

        it('should not re-render the whole view when a property of the view model changes', function () {            
            this.viewModel().anObservableProperty('A New Value');

            // Init for first rendering, update for first rendering an update of
            // property.
            expect(ko.bindingHandlers.test1.init).toHaveBeenCalledOnce();
            expect(ko.bindingHandlers.test1.update).toHaveBeenCalledTwice();
        });

        it('should remove children when new view model is null', function () {            
            this.viewModel(undefined);

            expect(this.wrapper).toBeEmpty()
        });
    });

    describe('binding a plain object with named view', function () {
        beforeEach(function () {
            $templating.set('myNamedPartTemplate', '<div><span id=plain-text>This is the template.</span> <span data-bind=\"test1: anObservableProperty\"></span></div>');

            ko.bindingHandlers.test1 = {
                init: this.spy(),

                update: this.spy(function (element, valueAccessor) {
                    ko.utils.unwrapObservable(valueAccessor()); // Ensure a subscription exists
                })
            };

            this.viewModel = {
                templateName: 'myNamedPartTemplate',
                anObservableProperty: ko.observable('')
            };

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\"></div>");
            this.applyBindingsToFixture({
                viewModel: this.viewModel
            });

            this.wrapper = document.getElementById("fixture");
        });

        it('should use the named template', function () {
            // Just check that when binding directly to a property of the view model 
            // binding handlers are getting called with it (a little brittle!)
            expect(document.getElementById('plain-text')).toHaveText('This is the template.');
        });

        it('should not re-render the whole view when a property of the view model changes', function () {            
            this.viewModel.anObservableProperty('A New Value');

            // Init for first rendering, update for first rendering an update of
            // property.
            expect(ko.bindingHandlers.test1.init).toHaveBeenCalledOnce();
            expect(ko.bindingHandlers.test1.update).toHaveBeenCalledTwice();
        });
    });

    describe('binding to a registered module view model', function () {
        beforeEach(function () {
            this.viewModelModuleCreator = this.stub().returns({ aProp: 'a value'});

            hx.provide('myInjectedViewModel', this.viewModelModuleCreator);            

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: 'myInjectedViewModel'\"><span data-bind='text: aProp'></span></div>");

            this.applyBindingsToFixture();

            this.wrapper = document.getElementById("fixture");
        });

        it('should use injector to load the view module', function () {
            expect(this.viewModelModuleCreator).toHaveBeenCalled();
        });
    });

    describe('parameters', function () {
        describe('without parameters binding handler', function () {
            beforeEach(function () {
                this.currentRouterParameters = { aParam: 4 };
                $router.current({ parameters: this.currentRouterParameters });

                this.viewModel = {
                    beforeShow: this.spy(),

                    show: this.spy(),

                    afterRender: this.spy(),

                    isAuthorised: this.stub().returns(true)
                };

                this.setHtmlFixture("<div id=fixture data-bind='component: viewModel'>This is the template</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should call beforeShow with router parameters', function () {
                expect(this.viewModel.beforeShow).toHaveBeenCalledWith(this.currentRouterParameters);
            });

            it('should call show with router parameters', function () {
                expect(this.viewModel.show).toHaveBeenCalledWith(this.currentRouterParameters);
            });

            it('should call afterRender with router parameters', function () {
                expect(this.viewModel.afterRender).toHaveBeenCalledWith(this.currentRouterParameters);
            });

            it('should call isAuthorised with router parameters', function () {
                expect(this.viewModel.isAuthorised).toHaveBeenCalledWith(this.currentRouterParameters);
            });
        });

        describe('parameters binding handler', function () {
            beforeEach(function () {
                this.currentRouterParameters = { aParam: 4, bParam: 6 };
                this.viewModelParameters = { aParam: 2, cParam: 10 };

                $router.current({ parameters: this.currentRouterParameters });

                this.viewModel = {
                    beforeShow: this.spy(),

                    show: this.spy(),

                    afterRender: this.spy(),

                    isAuthorised: this.stub().returns(true)
                };

                this.setHtmlFixture("<div id=fixture data-bind='component: viewModel, parameters: viewModelParameters'>This is the template</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel,
                    viewModelParameters: this.viewModelParameters
                });
            });

            it('should call beforeShow with router parameters, combined with explicit parameters (taking precendence)', function () {
                expect(this.viewModel.beforeShow).toHaveBeenCalledWith(_.extend({}, this.currentRouterParameters, this.viewModelParameters));
            });

            it('should call show with router parameters, combined with explicit parameters (taking precendence)', function () {
                expect(this.viewModel.show).toHaveBeenCalledWith(_.extend({}, this.currentRouterParameters, this.viewModelParameters));
            });

            it('should call afterRender with router parameters, combined with explicit parameters (taking precendence)', function () {
                expect(this.viewModel.afterRender).toHaveBeenCalledWith(_.extend({}, this.currentRouterParameters, this.viewModelParameters));
            });

            it('should call isAuthorised with router parameters, combined with explicit parameters (taking precendence)', function () {
                expect(this.viewModel.isAuthorised).toHaveBeenCalledWith(_.extend({}, this.currentRouterParameters, this.viewModelParameters));
            });
        });
    });

    describe('lifecycle', function () {
        describe('without AJAX requests', function () {
            beforeEach(function () {
                var _this = this;
                this.showHadContent = void 0;
                this.afterRenderHadContent = void 0;

                this.beforeShowThisContextValue = void 0;
                this.showThisContextValue = void 0;
                this.afterRenderThisContextValue = void 0;

                this.viewModel = {
                    anObservableProperty: ko.observable(),

                    beforeShow: this.spy(function () {
                        _this.beforeShowThisContextValue = this;
                    }),

                    show: this.spy(function () {
                        _this.showThisContextValue = this;
                        _this.showHadContent = _this.getFixtureTextContent().length > 0;
                    }),

                    afterRender: this.spy(function () {
                        _this.afterRenderThisContextValue = this;
                        _this.afterRenderHadContent = _this.getFixtureTextContent().length > 0;
                    })
                };

                this.setHtmlFixture("<div id=fixture data-bind='component: viewModel'>This is the template</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should call show function before afterRender', function () {
                expect(this.viewModel.show).toHaveBeenCalledBefore(this.viewModel.afterRender);
            });

            it('should call show function before rendering', function () {
                expect(this.showHadContent).toEqual(false);
            });

            it('should call afterRender function before rendering', function () {
                expect(this.afterRenderHadContent).toEqual(true);
            });

            it('should set viewModel as calling context (this) for beforeShow', function () {
                expect(this.beforeShowThisContextValue).toEqual(this.viewModel);
            });

            it('should set viewModel as calling context (this) for show', function () {
                expect(this.showThisContextValue).toEqual(this.viewModel);
            });

            it('should set viewModel as calling context (this) for afterRender', function () {
                expect(this.afterRenderThisContextValue).toEqual(this.viewModel);
            });
        });

        describe('with AJAX requests in show', function () {
            beforeEach(function () {
                var _this = this;

                this.viewModel = {
                    anObservableProperty: ko.observable(),

                    show: this.spy(function () {
                        $ajax.url('/Users/Managers').get();
                    }),

                    afterRender: this.spy(function () {
                        _this.afterRenderHadContent = _this.getFixtureTextContent().length > 0;
                    }),

                    hide: this.spy()
                };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\">\n    This is the template\n</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should not render template before ajax requests complete', function () {
                // We have not responded from server yet
                expect(document.getElementById("fixture")).toBeEmpty();
            });

            it('should not call afterRender before ajax requests complete', function () {
                // We have not responded from server yet
                expect(this.viewModel.afterRender).toHaveNotBeenCalled();
            });

            it('should add is-loading class to element', function () {
                // We have not responded from server yet
                expect(document.getElementById("fixture")).toHaveClass('is-loading');
            });

            describe('after AJAX requests complete', function () {
                beforeEach(function () {
                    this.server.respondWith('GET', '/Users/Managers', [
                        200, {
                            "Content-Type": "text/html"
                        }, 'A Response']);
                    this.server.respond();
                });

                it('should render template', function () {
                    // We have now responded from server
                    expect(document.getElementById("fixture")).not.toBeEmpty();
                });

                it('should call afterRender before ajax requests complete', function () {
                    // We have now responded from server
                    expect(this.viewModel.afterRender).toHaveBeenCalled();
                });

                it('should remove is-loading class to element', function () {
                    expect(document.getElementById("fixture")).not.toHaveClass('is-loading');
                });
            });
        });

        describe('with AJAX requests to get template', function () {
            beforeEach(function () {
                var _this = this;

                $templating.externalPath = '/Get/Template/{name}';
                this.templateText = 'This is the template text!'

                // We need to force an AJAX request for every test so a new template name is
                // required (else the result is cached for subsequent tests)
                this.templateName = 'myTemplateName' + Math.random();
                this.respondWithTemplate('/Get/Template/' + this.templateName, this.templateText);

                this.viewModel = {
                    templateName: this.templateName,

                    afterRender: this.spy(function () {
                        _this.afterRenderHadContent = _this.getFixtureTextContent().length > 0;
                    })
                };

                this.setHtmlFixture("<div id=fixture data-bind='component: viewModel'></div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should not render template before ajax requests complete', function () {
                // We have not responded from server yet
                expect(document.getElementById("fixture")).not.toHaveText(this.templateText);
            });

            it('should not call afterRender before ajax requests complete', function () {
                // We have not responded from server yet
                expect(this.viewModel.afterRender).toHaveNotBeenCalled();
            });

            it('should add is-loading class to element', function () {
                // We have not responded from server yet
                expect(document.getElementById("fixture")).toHaveClass('is-loading');
            });

            describe('after AJAX requests complete', function () {
                beforeEach(function () {

                    this.server.respond();
                });

                it('should render template', function () {
                    // We have now responded from server
                    expect(document.getElementById("fixture")).toHaveText(this.templateText);
                });

                it('should call afterRender once ajax requests complete', function () {
                    // We have now responded from server
                    expect(this.viewModel.afterRender).toHaveBeenCalled();
                });

                it('should remove is-loading class to element', function () {
                    expect(document.getElementById("fixture")).not.toHaveClass('is-loading');
                });
            });
        });

        describe('switching view models', function () {
            beforeEach(function () {
                var _this = this;

                $templating.set('viewModelOneTemplate', 'Template One');
                $templating.set('viewModelTwoTemplate', 'Template Two');

                this.viewModelOne = {
                    templateName: 'viewModelOneTemplate',
                    beforeShow: this.spy(),
                    show: this.spy(),
                    hide: this.spy(function() {
                        _this.hideThisContextValue = this;
                    })
                };

                this.viewModelTwo = {
                    templateName: 'viewModelTwoTemplate',
                    beforeShow: this.spy(),
                    show: this.spy(),
                    hide: this.spy()
                };

                this.viewModel = ko.observable(this.viewModelOne);
                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\">\n    This is the template\n</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });

                this.wrapper = document.getElementById("fixture");

                // Perform the switch of view models by updating the bound
                // observable.
                this.viewModel(this.viewModelTwo);
            });

            it('should call hide of existing view model before showing new one', function () {
                expect(this.viewModelOne.hide).toHaveBeenCalledBefore(this.viewModelTwo.beforeShow);
                expect(this.viewModelOne.hide).toHaveBeenCalledBefore(this.viewModelTwo.show);
            });

            it('should not call hide of new view model', function () {
                expect(this.viewModelTwo.hide).toHaveNotBeenCalled();
            });

            it('should switch the templates (when not anonymous)', function () {
                expect(this.wrapper).toHaveText('Template Two');
            });

            it('should set viewModel as calling context (this) for hide', function () {
                expect(this.hideThisContextValue).toEqual(this.viewModelOne);
            });            
        });

        describe('view model that updates observables in lifecycle methods', function () {
            beforeEach(function () {
                $templating.set('myNamedPartTemplate', 'This is the template');

                this.showObservable = showObservable = ko.observable();
                this.afterRenderObservable = afterRenderObservable = ko.observable();

                this.viewModel = {
                    show: this.spy(function() {
                        // Attach dependency
                        showObservable();
                    }),

                    afterRender: this.spy(function() {
                        // Attach dependency
                        afterRenderObservable();
                    })
                };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\"></div>");
                this.applyBindingsToFixture({ viewModel: this.viewModel });
            });

            it('should not re-render when observable in "show" method is updated', function () {
                this.showObservable('A new value');

                expect(this.viewModel.show).toHaveBeenCalledOnce()
            });

            it('should not re-render when observable in "afterRender" method is updated', function () {
                this.afterRenderObservable('A new value');

                expect(this.viewModel.afterRender).toHaveBeenCalledOnce()
            });
        });

        describe('component that fails authorisation', function () {
            beforeEach(function () {
                $templating.set('myNamedPartTemplate', 'This is the template');

                this.viewModel = {
                    templateName: 'myNamedPartTemplate',

                    show: this.spy(),

                    isAuthorised: function() { return false; }
                };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\"></div>");
                this.applyBindingsToFixture({ viewModel: this.viewModel });
            });

            it('should not render the view', function () {
                expect(document.getElementById('fixture')).toBeEmpty()
            })

            it('should not call the show function', function () {
                expect(this.viewModel.show).toHaveNotBeenCalled()
            })
        });

        describe('component that fails authorisation after having a successful already shown', function () {
            beforeEach(function () {
                $templating.set('authTemplate', 'This is the auth template');
                $templating.set('unauthTemplate', 'This is the unauth template');

                this.viewModel = ko.observable();

                this.authViewModel = { templateName: 'authTemplate', show: this.spy(), isAuthorised: function() { return true; } };
                this.unauthViewModel = { templateName: 'unauthTemplate', show: this.spy(), isAuthorised: function() { return false; } };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"component: viewModel\"></div>");
                this.applyBindingsToFixture({ viewModel: this.viewModel });

                this.viewModel(this.authViewModel);
                this.viewModel(this.unauthViewModel);
            });

            it('should clear the view', function () {
                expect(document.getElementById('fixture')).toBeEmpty()
            })

            it('should not call the show function', function () {
                expect(this.unauthViewModel.show).toHaveNotBeenCalled()
            })
        });
    });
});