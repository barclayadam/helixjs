describe('action binding handler', function() {
    var uiAction = hx.get('$UiAction');
    
    describe('sync action - always enabled', function() {
        beforeEach(function() {
            this.actionSpy = this.spy();
            this.action = uiAction(this.actionSpy);

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
            this.action = uiAction({
                enabled: this.enabled,
                action: this.actionSpy
            });
        });

        describe('default handler options', function() {
            beforeEach(function() {
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

        describe('onDisabled:"hide" option', function() {
            beforeEach(function() {
                this.setHtmlFixture("<div>" +
                                    " <a id='action-link' data-bind='action: action, onDisabled: \"hide\"'>Execute Action</a>" +
                                    "</div>");
                
                this.applyBindingsToFixture({
                    action: this.action
                });

                ko.utils.triggerEvent(document.getElementById('action-link'), 'click');
            });

            it('should set display:none when disabled', function() {
                expect(document.getElementById('action-link')).toBeHidden()
            })

            it('should set display attribute back to original when action enabled', function() {
                this.enabled(true)

                expect(document.getElementById('action-link')).not.toBeHidden()

                // When no styling originally applied, display property would be empty
                expect(document.getElementById('action-link').style.display).toEqual("");
            })

            it('should set display attribute back to original when updated multiple times with enabled == false, then re-enabled', function() {
                this.enabled(false)
                // Force an update. This scenario happens with computed that depend on multiple items, 
                // so even though the value does not change on multiple executions subscribers are
                // still notified
                this.enabled.valueHasMutated()
                this.enabled(true)

                expect(document.getElementById('action-link')).not.toBeHidden()

                // When no styling originally applied, display property would be empty
                expect(document.getElementById('action-link').style.display).toEqual("");
            })
        })
    })

    describe('async action', function() {
        beforeEach(function() {
            this.deferred = jQuery.Deferred();

            this.actionSpy = this.spy(function () {
                return this.deferred;
            }.bind(this));

            this.action = uiAction(this.actionSpy);

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

    describe('non-uiaction', function() {
        beforeEach(function() {
            this.deferred = jQuery.Deferred();

            this.actionSpy = this.spy(function () {
                return this.deferred;
            }.bind(this));

            this.action = this.actionSpy;

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

    describe('applied to form element', function() {
        beforeEach(function() {
            this.deferred = jQuery.Deferred();

            this.actionSpy = this.spy(function () {
                return this.deferred;
            }.bind(this));

            this.action = uiAction(this.actionSpy);

            this.setHtmlFixture("<div>" +
                                " <form id='action-form' data-bind='action: action'>" +
                                "   <button id='submit-action-form' type='submit'>Submit Action Form</button>" +
                                "   <input id='submit-input-action-form' type='submit' text='Submit Action Form' />" +
                                "   <button id='non-submit-action-form'>Non Action Form</button>" +
                                "</form>" +
                                "</div>");
            
            this.applyBindingsToFixture({
                action: this.action
            });

            // Click the submit button, which will result in a submission of the form
            ko.utils.triggerEvent(document.getElementById('action-form'), 'submit');
        });

        it('should execute action when form submitted', function() {
            expect(this.actionSpy).toHaveBeenCalledOnce();
        })

        it('should add an is-executing class when executed', function() {
            expect(document.getElementById('action-form')).toHaveClass('is-executing')          
        })

        it('should remove an is-executing class when execution has completed', function() {
            this.deferred.resolve()
            expect(document.getElementById('action-form')).not.toHaveClass('is-executing')          
        })
        
        it('should add an is-executing class to submit button when executed', function() {
            expect(document.getElementById('submit-action-form')).toHaveClass('is-executing')          
        })

        it('should add an is-executing class to input field with submit type when executed', function() {
            expect(document.getElementById('submit-input-action-form')).toHaveClass('is-executing')          
        })

        it('should not add an is-executing class to button that is not sunmit when executed', function() {
            expect(document.getElementById('non-submit-action-form')).not.toHaveClass('is-executing')          
        })

        it('should remove an is-executing class to submit button when execution has completed', function() {
            this.deferred.resolve()
            expect(document.getElementById('submit-action-form')).not.toHaveClass('is-executing')          
        })

        it('should work with other descendant binding controlling handlers', function() {
            this.setHtmlFixture("<form id='action-form' data-bind='with: true, action: action'></form>");
            
            this.applyBindingsToFixture({ action: this.action });
        })
    })
})