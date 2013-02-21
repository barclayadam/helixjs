describe('part binding handler', function () {
    var $templating = hx.get('$templating'),
        $ajax = hx.get('$ajax');

    describe('binding undefined view model', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\">\n    This is an anonymous template\n</div>");

        });

        it('should throw an exception', function () {
            expect(function() {
                this.applyBindingsToFixture({ viewModel: undefined });
            }.bind(this)).toThrow('A null or undefined view model cannot be passed to a part binding handler');
        });
    });

    describe('binding a plain object with anonymous template', function () {
        beforeEach(function () {
            this.viewModel = {
                aProperty: 'A Property',
                anObservableProperty: ko.observable('An observable property')
            };

            ko.bindingHandlers.test1 = {
                init: this.spy(),

                update: this.spy(function (element, valueAccessor) {
                    ko.utils.unwrapObservable(valueAccessor()); // Ensure a subscription exists
                })
            };

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\">\n    This is an anonymous template\n\n    <span data-bind=\"test1: anObservableProperty\"></span>\n</div>");
            this.applyBindingsToFixture({
                viewModel: this.viewModel
            });

            this.wrapper = document.getElementById("fixture");
            this.viewModel.anObservableProperty('A New Value');
        });

        it('should set view model as context when rendering template', function () {
            // Just check that when binding directly to a property of the view model 
            // binding handlers are getting called with it (a little brittle!)
            expect(ko.bindingHandlers.test1.init.args[0][1]()).toBe(this.viewModel.anObservableProperty);
        });

        it('should not re-render the whole view when a property of the view model changes', function () {
            // Init for first rendering, update for first rendering an update of
            // property.
            expect(ko.bindingHandlers.test1.init).toHaveBeenCalledOnce();
            expect(ko.bindingHandlers.test1.update).toHaveBeenCalledTwice();
        });
    });

    describe('binding a plain object with named view', function () {
        beforeEach(function () {
            $templating.set('myNamedPartTemplate', 'This is the template');

            this.viewModel = {
                templateName: 'myNamedPartTemplate'
            };

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\"></div>");
            this.applyBindingsToFixture({
                viewModel: this.viewModel
            });

            this.wrapper = document.getElementById("fixture");
        });

        it('should use the named template', function () {
            // Just check that when binding directly to a property of the view model 
            // binding handlers are getting called with it (a little brittle!)
            expect(this.wrapper).toHaveText('This is the template');
        });
    });

    describe('binding to a registered module view model', function () {
        beforeEach(function () {
            this.viewModelModuleCreator = this.stub().returns({ aProp: 'a value'});

            hx.provide('myInjectedViewModel', this.viewModelModuleCreator);            

            this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: 'myInjectedViewModel'\"><span data-bind='text: aProp'></span></div>");

            this.applyBindingsToFixture();

            this.wrapper = document.getElementById("fixture");
        });

        it('should use injector to load the view module', function () {
            expect(this.viewModelModuleCreator).toHaveBeenCalled();
        });
    });

    describe('lifecycle', function () {
        describe('without AJAX requests', function () {
            beforeEach(function () {
                var _this = this;
                this.showHadContent = void 0;
                this.afterShowHadContent = void 0;

                this.viewModel = {
                    anObservableProperty: ko.observable(),

                    show: this.spy(function () {
                        _this.showHadContent = _this.getFixtureTextContent().length > 0;
                    }),

                    afterShow: this.spy(function () {
                        _this.afterShowHadContent = _this.getFixtureTextContent().length > 0;
                    })
                };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\">\n    This is the template\n</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should call show function before afterShow', function () {
                expect(this.viewModel.show).toHaveBeenCalledBefore(this.viewModel.afterShow);
            });

            it('should call show function before rendering', function () {
                expect(this.showHadContent).toEqual(false);
            });

            it('should call afterShow function before rendering', function () {
                expect(this.afterShowHadContent).toEqual(true);
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

                    afterShow: this.spy(function () {
                        _this.afterShowHadContent = _this.getFixtureTextContent().length > 0;
                    }),

                    hide: this.spy()
                };

                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\">\n    This is the template\n</div>");
                
                this.applyBindingsToFixture({
                    viewModel: this.viewModel
                });
            });

            it('should not render template before ajax requests complete', function () {
                // We have not responded from server yet
                expect(document.getElementById("fixture")).toBeEmpty();
            });

            it('should not call afterShow before ajax requests complete', function () {
                // We have not responded from server yet
                expect(this.viewModel.afterShow).toHaveNotBeenCalled();
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

                it('should call afterShow before ajax requests complete', function () {
                    // We have now responded from server
                    expect(this.viewModel.afterShow).toHaveBeenCalled();
                });
            });
        });

        describe('switching view models', function () {
            beforeEach(function () {
                $templating.set('viewModelOneTemplate', 'Template One');
                $templating.set('viewModelTwoTemplate', 'Template Two');

                this.viewModelOne = {
                    templateName: 'viewModelOneTemplate',
                    beforeShow: this.spy(),
                    show: this.spy(),
                    hide: this.spy()
                };

                this.viewModelTwo = {
                    templateName: 'viewModelTwoTemplate',
                    beforeShow: this.spy(),
                    show: this.spy(),
                    hide: this.spy()
                };

                this.viewModel = ko.observable(this.viewModelOne);
                this.setHtmlFixture("<div id=\"fixture\" data-bind=\"part: viewModel\">\n    This is the template\n</div>");
                
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
        });
    });
});