describe('tag-based binding provider', function () {
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

    describe('binding handler specified as tag compatible', function () {
        var complexOptionPassed = undefined;

        beforeEach(function () {
            hx.bindingHandler('tagSample', {
                tag: 'tagSample',

                init: function (element, valueAccessor) {
                    ko.utils.setTextContent(element, valueAccessor());
                },

                update: function (element) {
                    ko.utils.toggleDomNodeCssClass(element, 'myClass', true);
                }
            });

            hx.bindingHandler('complexOptionSample', {
                tag: 'complexOptionSample',

                init: function (element, valueAccessor) {
                    complexOptionPassed = valueAccessor();
                }
            });

            hx.bindingHandler('templateTag', {
                tag: 'templateTag',
                
                init: function (element, valueAccessor) {
                    $templating.set('myNamedTemplate', 'A Cool Template');
                    ko.renderTemplate("myNamedTemplate", {}, {}, element, "replaceChildren");
                }
            });

            this.setHtmlFixture("<div>" +
                                 "<tagSample id=tag-sample data-option=\"'My Passed In Value'\" data-bind=\"css: { myOtherBoundClass: true }\"></tagSample>" +
                                 "<complexOptionSample id=complex-option-sample data-option=\"{ key: 'complex value' }\"></complexOptionSample>" +
                                 "<templateTag id=template-tag class=my-class></templateTag>" +
                                "</div>");

            this.applyBindingsToFixture({});
        });

        it('should use data-option for bindingHandler with same name as tag', function () {
            expect(document.getElementById("tag-sample")).toHaveText('My Passed In Value');
        });

        it('should use data-option for bindingHandler with same name as tag, working for complex objects', function () {
            expect(complexOptionPassed).toEqual({ key: 'complex value' });
        });

        it('should call binding handlers update function', function () {
            expect(document.getElementById("tag-sample")).toHaveClass('myClass');
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
    });

    describe('binding handler specified as tag compatible with children', function () {
        beforeEach(function () {
            hx.bindingHandler('tagSampleWithChildren', {
                tag: 'tagSampleWithChildren'
            });

            this.setHtmlFixture("<div>" +
                                 "<tagSampleWithChildren id=\"tag-sample-with-children\">" +
                                    "<div>" + 
                                        "<span data-bind=\"text: 'Some bound text'\" id=\"child-with-bound-text\"></span>" +
                                    "</div>" +
                                 "</tagSample>" +
                                "</div>");

            this.applyBindingsToFixture({});
        });

        it('should copy all children across', function () {
            expect(document.getElementById("tag-sample-with-children").children[0].tagName.toLowerCase()).toBe("div");
        });

        it('should apply bindings to children correctly', function () {
            expect(document.getElementById("child-with-bound-text")).toHaveText('Some bound text');
        });
    });

    describe('binding handler with same name as a supplied property', function () {
        beforeEach(function () {
            hx.bindingHandler('viewModelProperty', function() {
                return {
                    tag: ['input'],

                    init: function (element, valueAccessor) {
                        ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                    }
                }
            });

            this.setHtmlFixture("<div><input id=input-control data-bind='value: viewModelProperty'/></div>");
            this.applyBindingsToFixture({ viewModelProperty: 'a value '});            
        });

        it('should apply binding handler', function () {
            expect(document.getElementById("input-control")).toHaveClass('a-new-class');
        });
    });

    describe('binding handler supplied as function, no dependencies', function () {
        beforeEach(function () {
            hx.bindingHandler('inputEnhancer', function() {
                return {
                    tag: ['input'],

                    init: function (element, valueAccessor) {
                        ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                    }
                }
            });

            this.setHtmlFixture("<div><input id=input-control /></div>");
            this.applyBindingsToFixture({});            
        });

        it('should call binding handlers init function for all tags', function () {
            expect(document.getElementById("input-control")).toHaveClass('a-new-class');
        });
    });

    describe('binding handler supplied as function, with dependencies', function () {
        var dependencyValue = { myClassName: 'my-class' };

        beforeEach(function () {
            hx.provide('bindingHandlerDependency', dependencyValue);

            hx.bindingHandler('inputEnhancer', ['bindingHandlerDependency'], function(bindingHandlerDependency) {
                return {
                    tag: ['input'],

                    init: function (element, valueAccessor) {
                        ko.utils.toggleDomNodeCssClass(element, bindingHandlerDependency.myClassName, true);
                    }
                }
            });

            this.setHtmlFixture("<div><input id=input-control /></div>");
            this.applyBindingsToFixture({});            
        });

        it('should call binding handlers init function for all tags', function () {
            expect(document.getElementById("input-control")).toHaveClass(dependencyValue.myClassName);
        });
    });

    describe('binding handler specified as tag compatible, with explicitly defined data-bind', function () {
        it('should not override value passed through data-bind', function () {
            var passedValue = 'My passed value';

            hx.bindingHandler('inputEnhancer', {
                tag: 'input',

                init: function (element, valueAccessor) {
                    expect(valueAccessor()).toBe(passedValue)
                }
            });

            this.setHtmlFixture("<input id='input-control' data-bind='inputEnhancer: passedValue' />");
            this.applyBindingsToFixture({ passedValue: passedValue });
        });
    });

    describe('binding handler specified as tag compatible for multiple tags', function () {
        beforeEach(function () {
            hx.bindingHandler('inputEnhancer', {
                tag: ['input', 'select'],

                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                }
            });

            this.setHtmlFixture("<div><input id=\"input-control\" /><input id=\"select-control\" /></div>");
            this.applyBindingsToFixture({});
        });

        it('should call binding handlers init function for all tags', function () {
            expect(document.getElementById("input-control")).toHaveClass('a-new-class');
            expect(document.getElementById("select-control")).toHaveClass('a-new-class');
        });
    });

    describe('multiple binding handlers specified as tag compatible', function () {
        beforeEach(function () {
            var _this = this;
            
            hx.bindingHandler('exampleEnhancer1', {
                tag: 'example',

                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'a-new-class', true);
                }
            });

            hx.bindingHandler('exampleEnhancer2', {
                tag: 'example',

                init: function (element, valueAccessor) {
                    ko.utils.toggleDomNodeCssClass(element, 'another-new-class', true);
                }
            });

            this.setHtmlFixture("<div><example id=example-control /></div>");
            this.applyBindingsToFixture({});
        });

        it('should call all binding handlers init function', function () {
            expect(document.getElementById("example-control")).toHaveClass('a-new-class');
            expect(document.getElementById("example-control")).toHaveClass('another-new-class');
        });
    });
});