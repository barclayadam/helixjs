describe('expandable', function() {
    describe('basic - no overrides', function() {
        beforeEach(function() {
            this.setHtmlFixture("<expandable id=expandable data-option=\"{ title: 'My cool title' }\">" +
                                "  <p id=expandable-content data-bind='text: content'></p>" +
                                "</expandable>");
            
            this.applyBindingsToFixture({ content: 'This is the content' });
        });

        it('should hide the content by default', function() {
            expect(document.getElementById('expandable-content')).toBeHidden();
        })

        it('should maintain view model as current binding context', function() {
            expect(document.getElementById('expandable-content')).toHaveText('This is the content');
        })

        it('should toggle visibility when clicking the header', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            expect(document.getElementById('expandable-content')).not.toBeHidden();
        })

        it('should add open class to expandable element when opened', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            expect(document.getElementById('expandable')).toHaveClass('open');
        })

        it('should remove open class to expandable element when closed', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            expect(document.getElementById('expandable')).not.toHaveClass('open');
        })
    })

    describe('external open observable', function() {
        beforeEach(function() {
            this.isOpen = ko.observable(true);

            this.setHtmlFixture("<expandable id=expandable data-option=\"{ title: 'My cool title', open: isOpen }\">" +
                                "  <p id=expandable-content>This is the content</p>" +
                                "</expandable>");
            
            this.applyBindingsToFixture({ isOpen: this.isOpen });
        });

        it('should set visibility to that of the open observable passed', function() {
            expect(document.getElementById('expandable-content')).not.toBeHidden();
        })

        it('should toggle visibility when clicking the header', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            expect(document.getElementById('expandable-content')).toBeHidden();
        })

        it('should set observable value when clicking the header', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByTagName('header')[0], 'click');
            expect(this.isOpen()).toBe(false);
        })

        it('should change visibility when external observable property is changed', function() {
            this.isOpen(false);
            expect(document.getElementById('expandable-content')).toBeHidden();
        })
    })
})