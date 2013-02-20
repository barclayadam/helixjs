describe('component binding provider', function () {
    var $templating = hx.get('$templating');

    // A small selection of tests for existing functionality as a sanity check. NOT comprehensive.
    describe('existing functionality', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id='literal' data-bind=\"text: 'My Text'\"></div>\n<div id='multiple' data-bind=\"text: 'My Text', css: { myClass: true }\"></div>\n<div id='non-updated' data-bind=\"text: myTextObservable\"></div>\n<div id='updated' data-bind=\"text: myUpdatedTextObservable\"></div>");
            this.myTextObservable = ko.observable('A Value');
            this.myUpdatedTextObservable = ko.observable('A Value');
            this.applyBindingsToFixture({
                myTextObservable: this.myTextObservable,
                myUpdatedTextObservable: this.myUpdatedTextObservable
            });
            this.myUpdatedTextObservable('A New Value');
        });

        it('should apply bindings with literal values', function () {
            expect(document.getElementById('literal')).toHaveText('My Text');
        });

        it('should apply multiple bindings with literal values', function () {
            expect(document.getElementById('multiple')).toHaveText('My Text');
            expect(document.getElementById('multiple')).toHaveClass('myClass');
        });

        it('should apply bindings with observable values', function () {
            expect(document.getElementById('non-updated')).toHaveText(this.myTextObservable());
        });

        it('should apply bindings with observable values for updates', function () {
            expect(document.getElementById('updated')).toHaveText(this.myUpdatedTextObservable());
        });
    });

    describe('binding handler not specified as tag compatible', function () {
        beforeEach(function () {
            this.setHtmlFixture("<div id='fixture' data-option=\"'My Text'\">Existing Value</div>");
            this.applyBindingsToFixture({});
        });

        it('should not use binding handler', function () {
            expect(document.getElementById("fixture")).toHaveText('Existing Value');
        });
    });

    describe('binding handler specified as tag compatible, with replacement', function () {
        beforeEach(function () {
            var _this = this;
            this.valuePassed = void 0;
            this.complexValuePassed = void 0;

            ko.bindingHandlers.tagSample = {
                tag: 'tagSample->div',
                init: function (element, valueAccessor) {
                    ko.utils.setTextContent(element, 'My New Text');
                    _this.valuePassed = valueAccessor();
                },
                update: function (element) {
                    ko.utils.toggleDomNodeCssClass(element, 'myClass', true);
                }
            };

            ko.bindingHandlers.complexOptionSample = {
                tag: 'complexOptionSample->span',
                init: function (element, valueAccessor) {
                    _this.complexValuePassed = valueAccessor();
                }
            };

            ko.bindingHandlers.templateTag = {
                tag: 'templateTag->div',
                init: function (element, valueAccessor) {
                    $templating.set('myNamedTemplate', 'A Cool Template');
                    ko.renderTemplate("myNamedTemplate", {}, {}, element, "replaceChildren");
                }
            };

            this.setHtmlFixture("<div>\n    <tagSample id=\"tag-sample\" data-option=\"'My Passed In Value'\" data-bind=\"css: { myOtherBoundClass: true }\"></tagSample>\n    <complexOptionSample id=\"complex-option-sample\" data-option=\"{ key: 'complex value' }\"></complexOptionSample>\n    <templateTag id=\"template-tag\" class=\"my-class\"></templateTag>\n</div>");
            this.applyBindingsToFixture({});
        });

        it('should call binding handlers init function, and allow text content of nodes to be set', function () {
            expect(document.getElementById("tag-sample")).toHaveText('My New Text');
        });

        it('should call binding handlers update function', function () {
            expect(document.getElementById("tag-sample")).toHaveClass('myClass');
        });

        it('should replace node using tag name specified in binding handler', function () {
            expect(document.getElementById("tag-sample").tagName.toLowerCase()).toEqual('div');
            expect(document.getElementById("complex-option-sample").tagName.toLowerCase()).toEqual('span');
            expect(document.getElementById("template-tag").tagName.toLowerCase()).toEqual('div');
        });

        it('should work with templating', function () {
            expect(document.getElementById("template-tag")).toHaveText('A Cool Template');
        });

        it('should maintain existing attributes', function () {
            expect(document.getElementById("template-tag")).toHaveAttr('class', 'my-class');
        });

        it('should use data-bind attribute as well', function () {
            expect(document.getElementById("tag-sample")).toHaveClass('myOtherBoundClass');
        });

        it('should pass simple type data-option to init', function () {
            expect(this.valuePassed).toEqual('My Passed In Value');
        });

        it('should pass complex type data-option to init', function () {
            expect(this.complexValuePassed).toEqual({
                key: 'complex value'
            });
        });
    });

    describe('binding handler specified as tag compatible, without replacement', function () {
        beforeEach(function () {
            var _this = this;
            ko.bindingHandlers.inputEnhancer = {
                tag: 'input',
                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                }
            };
            this.setHtmlFixture("<div>\n    <input id=\"input-control\" />\n</div>");
            this.applyBindingsToFixture({});
        });

        it('should call binding handlers init function', function () {
            expect(document.getElementById("input-control")).toHaveClass('a-new-class');
        });

        it('should not replace the element with another', function () {
            expect(document.getElementById("input-control").tagName).toEqual('INPUT');
        });
    });

    describe('multiple binding handlers specified as tag compatible, without replacement', function () {
        beforeEach(function () {
            var _this = this;
            
            ko.bindingHandlers.exampleEnhancer1 = {
                tag: 'example',
                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                }
            };

            ko.bindingHandlers.exampleEnhancer2 = {
                tag: 'example',
                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'another-new-class', true);
                }
            };

            this.setHtmlFixture("<div>\n    <example id=\"example-control\" />\n</div>");
            this.applyBindingsToFixture({});
        });

        it('should call all binding handlers init function', function () {
            expect(document.getElementById("example-control")).toHaveClass('a-new-class');
            expect(document.getElementById("example-control")).toHaveClass('another-new-class');
        });

        it('should not replace the element with another', function () {
            expect(document.getElementById("example-control").tagName).toEqual('EXAMPLE');
        });
    });
});