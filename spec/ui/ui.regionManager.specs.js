describe('region manager', function () {
    var $RegionManager = hx.get('$RegionManager'),
        $templating = hx.get('$templating'),
        $ajax = hx.get('$ajax'),
        $log = hx.get('$log');

    describe('region without a region manager', function () {
        beforeEach(function () {
            this.setHtmlFixture("<region id='my-region'></region>");
        });

        it('should throw an exception', function () {
            expect(function() {
                this.applyBindingsToFixture();
            }.bind(this)).toThrow('A region binding handler must be a child of a regionManager or app binding handler');
        });
    });

    describe('single region', function () {
        beforeEach(function () {
            this.regionManager = new $RegionManager();

            // Typically, a region manager would be the root `app` on the
            // body, but it is not a requirement.
            this.setHtmlFixture("<div id=body data-bind='regionManager: regionManager'>" +
                                 " <header id=header>This is the header</header>" +
                                 " <region id=my-main-region class=region></region>" +
                                 " <footer id=footer>This is the footer</footer>" +
                                 "</div>");

            this.applyBindingsToFixture({
                regionManager: this.regionManager
            });
        });

        it('should not affect any contents of element that is not a region', function () {
            expect(document.getElementById("header")).toHaveText("This is the header");
            expect(document.getElementById("footer")).toHaveText("This is the footer");
        });

        it('should place no content in region if no view model has been set', function () {
            expect(document.getElementById("my-main-region")).toBeEmpty();
        });

        describe('with view model set', function () {
            beforeEach(function () {
                $templating.set('myViewModelTemplateName', 'This is the template');

                this.viewModel = {
                    templateName: 'myViewModelTemplateName'
                };

                this.regionManager.showSingle(this.viewModel);
            });

            it('should render the view model and its associated template in single region', function () {
                expect(document.getElementById("my-main-region")).toHaveText('This is the template');
            });
        });
    });

    describe('multiple regions with a default set', function () {
        beforeEach(function () {
            this.regionManager = new $RegionManager();
            
            this.setHtmlFixture("<div id=\"body\" data-bind=\"regionManager: regionManager\">" +
                                "  <header id='header'>This is the header</header>" +
                                "  <region id='main' data-default='true'></region>" +
                                "  <region id='help'></region>" +
                                "  <footer id='footer'>This is the footer</footer>" +
                                "</div>");
            
            this.applyBindingsToFixture({
                regionManager: this.regionManager
            });
        });

        it('should not affect any contents of element that is not a region', function () {
            expect(document.getElementById("header")).toHaveText("This is the header");
            expect(document.getElementById("footer")).toHaveText("This is the footer");
        });

        it('should replace all regions with div tags', function () {
            expect(document.getElementById("main")).toExist();
            expect(document.getElementById("help")).toExist();
        });

        it('should place no content in regions if no view model has been set', function () {
            expect(document.getElementById("main")).toBeEmpty();
            expect(document.getElementById("help")).toBeEmpty();
        });

        describe('showSingle', function () {
            beforeEach(function () {
                $templating.set('myViewModelTemplateName', 'This is the main template');

                this.viewModel = {
                    templateName: 'myViewModelTemplateName'
                };

                this.regionManager.showSingle(this.viewModel);
            });

            it('should set the view model to the default region', function () {
                expect(document.getElementById("main")).toHaveText('This is the main template');
            });
        });

        describe('showSingle - with IoC-provided viewModel', function () {
            beforeEach(function () {
                $templating.set('myViewModelTemplateName', 'This is the main template');

                hx.provide('myViewModel', { templateName: 'myViewModelTemplateName' })

                this.regionManager.showSingle('myViewModel');
            });

            it('should set the view model to the default region', function () {
                expect(document.getElementById("main")).toHaveText('This is the main template');
            });
        });

        describe('show', function () {
            describe('with one view model set', function () {
                beforeEach(function () {
                    $templating.set('myViewModelTemplateName', 'This is the main template');

                    this.mainViewModel = {
                        templateName: 'myViewModelTemplateName'
                    };

                    this.regionManager.show({
                        'main': this.mainViewModel
                    });
                });

                it('should render the view model and its associated template in set region', function () {
                    expect(document.getElementById("main")).toHaveText('This is the main template');
                });

                it('should leave the unset region blank', function () {
                    expect(document.getElementById("help")).toBeEmpty();
                });
            });

            describe('with all view models set', function () {
                beforeEach(function () {
                    $templating.set('myMainViewModelTemplateName', 'This is the main template');
                    $templating.set('myHelpViewModelTemplateName', 'This is the help template');

                    this.mainViewModel = {
                        templateName: 'myMainViewModelTemplateName'
                    };

                    this.helpViewModel = {
                        templateName: 'myHelpViewModelTemplateName'
                    };

                    this.regionManager.show({
                        'main': this.mainViewModel,
                        'help': this.helpViewModel
                    });
                });

                it('should render the view models and associated templates', function () {
                    expect(document.getElementById("main")).toHaveText('This is the main template');
                    expect(document.getElementById("help")).toHaveText('This is the help template');
                });

                describe('show called again with only a single region', function () {
                    beforeEach(function () {
                        $templating.set('myNewMainViewModelTemplateName', 'This is the new main template');

                        this.newMainViewModel = {
                            templateName: 'myNewMainViewModelTemplateName'
                        };
                        
                        this.regionManager.show({
                            'main': this.newMainViewModel
                        });
                    });

                    it('should re-render the changed region', function () {
                        expect(document.getElementById("main")).toHaveText('This is the new main template');
                    });

                    it('should not change the region not passed in', function () {
                        expect(document.getElementById("help")).toHaveText('This is the help template');
                    });
                });
            });

            describe('with unknown region specified in show', function () {
                beforeEach(function () {
                    $log.debug = this.spy();

                    this.regionManager.show({
                        'main': {},
                        'unknown': {}
                    });
                });

                it('should log a debug error message', function () {
                    expect($log.debug).toHaveBeenCalledWith("This region manager does not have a 'unknown' region");
                });
            });
        });
    });
});