describe('expandable', function() {
    describe('basic - no overrides', function() {
        beforeEach(function() {
            this.setHtmlFixture("<expandable id=expandable data-option=\"{ title: 'My cool title' }\">" +
                                "  <p id=expandable-content data-bind='text: content'></p>" +
                                "</expandable>");
            
            this.applyBindingsToFixture({ content: 'This is the content' });
        });

        it('should maintain view model as current binding context', function() {
            expect(document.getElementById('expandable-content')).toHaveText('This is the content');
        })

        it('should add closed class by default', function() {
            expect(document.getElementById('expandable')).toHaveClass('closed');
        })

        it('should remove closed class to expandable element when opened', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            expect(document.getElementById('expandable')).not.toHaveClass('closed');
        })

        it('should add open class to expandable element when opened', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            expect(document.getElementById('expandable')).toHaveClass('open');
        })

        it('should remove open class to expandable element when closed', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            expect(document.getElementById('expandable')).not.toHaveClass('open');
        })

        it('should add closed class to expandable element when closed', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            expect(document.getElementById('expandable')).toHaveClass('closed');
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

        it('should add open class to match initial value of open observable', function() {
            expect(document.getElementById('expandable')).toHaveClass('open');
        })

        it('should set observable value when clicking the header', function() {
            ko.utils.triggerEvent(document.getElementById('expandable').getElementsByClassName('title')[0], 'click');
            expect(this.isOpen()).toBe(false);
        })

        it('should change open / closed classes when external observable is changed', function() {
            this.isOpen(false);
            expect(document.getElementById('expandable')).not.toHaveClass('open');
            expect(document.getElementById('expandable')).toHaveClass('closed');
        })
    })
})