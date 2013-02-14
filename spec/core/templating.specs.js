describe('templating', function () {
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

    describe('string templates', function () {
        describe('when a named template is added', function () {
            beforeEach(function () {
                hx.templating.set('myNamedTemplate', 'A Cool Template');
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
                hx.templating.set('myNamedTemplate', 'A Cool Template');
                hx.templating.set('myNamedTemplate', 'A Cool Template 2');
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
                hx.templating.set('myNamedTemplate', this.template);
                this.setHtmlFixture("<div id=\"templated\" data-bind=\"template: 'myNamedTemplate'\"></div>");
                this.applyBindingsToFixture({});
                this.wrapper = document.getElementById('templated');
            });

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
                    hx.templating.set('myNamedTemplate', 'Explicitly set template again');
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
                hx.templating.externalPath = '/Get/Template/{name}';
                this.respondWithTemplate('/Get/Template/myExternalTemplate', this.templateText);
                this.setHtmlFixture("<div id='one' data-bind=\"template: 'myExternalTemplate'\"></div>\n<div id='two' data-bind=\"template: 'myExternalTemplate'\"></div>");
                this.ajaxSpy = this.spy($, 'ajax');
                this.applyBindingsToFixture({});
                this.wrapperOne = document.getElementById("one");
                this.wrapperTwo = document.getElementById("two");
            });

            it('should immediately render the loading template (hx.templating.loadingTemplate)', function () {
                expect(this.wrapperOne).toHaveHtml(hx.templating.loadingTemplate);
                expect(this.wrapperTwo).toHaveHtml(hx.templating.loadingTemplate);
            });

            it('should only attempt one load of the document from the server', function () {
                expect(this.ajaxSpy).toHaveBeenCalledOnce();
            });

            describe('when template is successfully loaded using hx.templating.externalPath', function () {
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