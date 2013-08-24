describe('templating', function () {
    beforeEach(function() {
        this.$templating = hx.get('$templating');
    });
    
    describe('when using built-in template binding handler with anonymous template', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id=\"templated\" data-bind=\"template: {}\">My Anonymous Template Text</div>");
            this.applyBindingsToFixture({});
            this.wrapper = document.getElementById('templated');
        });
        
        it('should render the anonymous template', function () {
            expect(this.wrapper).toHaveText('My Anonymous Template Text');
        });
    });

    describe('when using built-in template binding handler with named template', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id='named-template'>My Named Template Text</div>" +
                                "<div id=templated data-bind=\"template: { name: 'named-template' }\"></div>");

            this.applyBindingsToFixture({});
            this.wrapper = document.getElementById('templated');
        });
        
        it('should render the named template', function () {
            expect(this.wrapper).toHaveText('My Named Template Text');
        });
    });

    describe('string templates', function () {
        describe('when a named template is added', function () {
            beforeEach(function () {
                this.$templating.set('myNamedTemplate', 'A Cool Template');
                this.setHtmlFixture("<div id=\"templated\" data-bind=\"template: 'myNamedTemplate'\"></div>");
                this.applyBindingsToFixture({});
                this.wrapper = document.getElementById('templated');
            });

            it('should render template', function () {
                expect(this.wrapper).toHaveText('A Cool Template');
            });
        });

        describe('when a named template is set twice', function () {
            beforeEach(function () {
                this.$templating.set('myNamedTemplate', 'A Cool Template');
                this.$templating.set('myNamedTemplate', 'A Cool Template 2');
                this.setHtmlFixture("<div id=\"templated\" data-bind=\"template: 'myNamedTemplate'\"></div>");
                this.applyBindingsToFixture({});
                this.wrapper = document.getElementById('templated');
            });

            it('should render the last template added', function () {
                expect(this.wrapper).toHaveText('A Cool Template 2');
            });
        });

        describe('when a named template is an observable', function () {
            beforeEach(function () {
                this.template = ko.observable('A Cool Template');
                this.$templating.set('myObservableNamedTemplate', this.template);
                this.setHtmlFixture("<div id=\"templated\" data-bind=\"template: 'myObservableNamedTemplate'\"></div>");
                this.applyBindingsToFixture({});
                this.wrapper = document.getElementById('templated');
            });

            afterEach(function() {
                this.$templating.remove('myObservableNamedTemplate')
            })

            it('should render the template', function () {
                expect(this.wrapper).toHaveText(this.template());
            });

            describe('that is updated', function () {
                beforeEach(function () {
                    this.template('Some other cool template');
                });
                it('should re-render the template', function () {
                    expect(this.wrapper).toHaveText('Some other cool template');
                });
            });

            describe('that is set again', function () {
                beforeEach(function () {
                    this.$templating.set('myObservableNamedTemplate', 'Explicitly set template again');
                });
                it('should re-render the template', function () {
                    expect(this.wrapper).toHaveText('Explicitly set template again');
                });
            });
        });
    });

    describe('external templates', function () {
        describe('when a template name does not match an existing element, or string template it is loaded externally', function () {
            beforeEach(function () {
                this.templateText = "A cool external template";
                this.$templating.loadingTemplate = 'Loading...'
                this.$templating.externalPath = '/Get/Template/{name}';
                this.respondWithTemplate('/Get/Template/myExternalTemplateSingleLoad', this.templateText);
                this.setHtmlFixture("<div id='one' data-bind=\"template: 'myExternalTemplateSingleLoad'\"></div>" +
                                    "<div id='two' data-bind=\"template: 'myExternalTemplateSingleLoad'\"></div>");
                
                this.ajaxSpy = this.spy($, 'ajax');

                this.applyBindingsToFixture({});

                this.wrapperOne = document.getElementById("one");
                this.wrapperTwo = document.getElementById("two");
            });

            afterEach(function() {
                this.$templating.remove('myExternalTemplateSingleLoad');
            })

            it('should immediately render the loading template (this.$templating.loadingTemplate)', function () {
                expect(this.wrapperOne).toHaveText(this.$templating.loadingTemplate);
                expect(this.wrapperTwo).toHaveText(this.$templating.loadingTemplate);
            });

            it('should only attempt one load of the document from the server', function () {
                expect(this.ajaxSpy).toHaveBeenCalledOnce();
            });

            describe('when template is successfully loaded using this.$templating.externalPath', function () {
                beforeEach(function () {
                    this.server.respond();
                });

                it('should render template', function () {
                    expect(this.wrapperOne).toHaveText(this.templateText);
                    expect(this.wrapperTwo).toHaveText(this.templateText);
                });
            });
        });
    });
});