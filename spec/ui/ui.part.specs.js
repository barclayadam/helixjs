describe('part binding handler', function() {
    var $templating = hx.get('$templating');

    function registerTemplatedBindingHandler(name, template) {
        $templating.set(name, template);

        hx.bindingHandler(name, {
             tag: name,

             init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ko.bindingHandlers.part.prepare(element, bindingContext);
                ko.renderTemplate(name, bindingContext, {}, element, 'replaceChildren');

                return { "controlsDescendantBindings" : true }
            }
        });
    }

    describe('single child as content', function() {
        registerTemplatedBindingHandler('partSingleChild', 
                        '<div id=wrapper>' +                                 
                        '  <part id=content></part>' +
                        '</div>');

        beforeEach(function(){
            this.setHtmlFixture(
                "<partSingleChild><p id=child-paragraph>This will be within the wrapper</p></partSingleChild>");

            this.applyBindingsToFixture();
        })

        it('should include child node at part location with id "content", replacing part node', function() {
           expect(document.getElementById('child-paragraph').parentNode.id).toBe('wrapper'); 
        })
    });    

    describe('multiple children as content', function() {
        registerTemplatedBindingHandler('partSingleChild', 
                        '<div id=wrapper>' +                                 
                        '  <part id=content></part>' +
                        '</div>');

        beforeEach(function(){
            this.setHtmlFixture(
                "<partSingleChild>" +
                    "<p id=child-paragraph-1>This will be within the wrapper</p>" +
                    "<p id=child-paragraph-2>This will be within the wrapper</p>" +
                "</partSingleChild>");

            this.applyBindingsToFixture();
        })

        it('should include children nodes at part location with id "content", replacing part node', function() {
           expect(document.getElementById('child-paragraph-1').parentNode.id).toBe('wrapper'); 
           expect(document.getElementById('child-paragraph-2').parentNode.id).toBe('wrapper'); 
        })
    });    

    describe('single overriding part', function() {
        registerTemplatedBindingHandler('partSingleOverride', 
                        '<div id=wrapper>' +                                 
                        '  <part id=my-override-part></part>' +
                        '</div>');

        beforeEach(function(){
            this.setHtmlFixture(
                "<partSingleOverride><part id=my-override-part>This will be within the wrapper</part></partSingleOverride>");

            this.applyBindingsToFixture();
        })

        it('should include child node at part location with id "content"', function() {
           expect(document.getElementById('wrapper')).toHaveText('This will be within the wrapper'); 
        })
    });    

    describe('multiple overriding part', function() {
        registerTemplatedBindingHandler('partMultipleOverride', 
                        '<div id=wrapper-1>' +                                 
                        '  <part id=my-override-part-1></part>' +            
                        '</div>' +
                        '<div id=wrapper-2>' +                                 
                        '  <part id=my-override-part-2></part>' +            
                        '</div>');

        beforeEach(function(){
            this.setHtmlFixture(
                "<partMultipleOverride>" +
                "  <part id=my-override-part-1>This will be within the first wrapper</part>" +
                "  <part id=my-override-part-2>This will be within the second wrapper</part>" +
                "</partMultipleOverride>");

            this.applyBindingsToFixture();
        })

        it('should include child node at part location with id "content"', function() {
           expect(document.getElementById('wrapper-1')).toHaveText('This will be within the first wrapper'); 
           expect(document.getElementById('wrapper-2')).toHaveText('This will be within the second wrapper');
        })
    });

    describe('single overriding part plus content', function() {
        registerTemplatedBindingHandler('partSingleOverrideAndContent', 
                        '<div id=wrapper-for-override>' +                                 
                        '  <part id=my-override-part></part>' +
                        '</div>' +
                        '<div id=wrapper-for-content>' +                                 
                        '  <part id=content></part>' +
                        '</div>');

        beforeEach(function(){
            this.setHtmlFixture(
                "<partSingleOverrideAndContent>" +
                  "<part id=my-override-part><p id=override-paragraph class=override-paragraph>This will be within the wrapper</p></part>" +
                  "<p id=content-paragraph>This is the content</p>" +
                "</partSingleOverride>");

            this.applyBindingsToFixture();
        })

        it('should include override node at override part location', function() {
           expect(document.getElementById('override-paragraph').parentNode.id).toBe('wrapper-for-override'); 
        })

        it('should include non-overriding elements at content part', function() {
           expect(document.getElementById('content-paragraph').parentNode.id).toBe('wrapper-for-content'); 
        })

        it('should not include part overrides in content part', function() {
           expect(document.getElementsByClassName('override-paragraph').length).toBe(1); 
        })
    });   
});