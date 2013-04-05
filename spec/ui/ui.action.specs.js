describe('action binding handler', function() {
	describe('sync action - always enabled', function() {
        beforeEach(function() {
            this.actionSpy = this.spy();
            this.action = new hx.UiAction(this.actionSpy);

            this.setHtmlFixture("<div>" +
                                " <a id='action-link' data-bind='action: action'>Execute Action</a>" +
                                "</div>");
            
            this.applyBindingsToFixture({
                action: this.action
            });

            ko.utils.triggerEvent(document.getElementById('action-link'), 'click');
        });

        it('should execute action when click event trigger', function() {
        	expect(this.actionSpy).toHaveBeenCalledOnce();
        })
    })

    describe('sync action - disabled', function() {
        beforeEach(function() {
        	this.enabled = ko.observable(false)
            this.actionSpy = this.spy();
            this.action = new hx.UiAction({
            	enabled: this.enabled,
            	action: this.actionSpy
            });

            this.setHtmlFixture("<div>" +
                                " <a id='action-link' data-bind='action: action'>Execute Action</a>" +
                                "</div>");
            
            this.applyBindingsToFixture({
                action: this.action
            });

            ko.utils.triggerEvent(document.getElementById('action-link'), 'click');
        });

        it('should not execute action when click event trigger', function() {
        	expect(this.actionSpy).toHaveNotBeenCalled();
        })

        it('should add disabled attribute to element', function() {
        	expect(document.getElementById('action-link')).toHaveAttr('disabled', 'disabled')
        })

        it('should remove disabled attribute from element when subsequently enabled', function() {
        	this.enabled(true)
        	expect(document.getElementById('action-link')).not.toHaveAttr('disabled')
        })
    })

	describe('async action', function() {
        beforeEach(function() {
            this.deferred = jQuery.Deferred();

            this.actionSpy = this.spy(function () {
                return this.deferred;
            }.bind(this));

            this.action = new hx.UiAction(this.actionSpy);

            this.setHtmlFixture("<div>" +
                                " <a id='action-link' data-bind='action: action'>Execute Action</a>" +
                                "</div>");
            
            this.applyBindingsToFixture({
                action: this.action
            });

            ko.utils.triggerEvent(document.getElementById('action-link'), 'click');
        });

        it('should add an is-executing class when executed', function() {
        	expect(document.getElementById('action-link')).toHaveClass('is-executing')        	
        })

        it('should remove an is-executing class when execution has completed', function() {
        	this.deferred.resolve()
        	expect(document.getElementById('action-link')).not.toHaveClass('is-executing')        	
        })

	})
})