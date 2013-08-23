describe('dialog', function() {
    beforeEach(function() {
        this.$dialog = hx.get('$dialog');
        this.$templating = hx.get('$templating');

        this.$templating.set('myDialogTemplate', '<div id=my-dialog-content><h3>My Dialog Content</h3><input id=my-dialog-input /></div>');
    })

    beforeEach(function() {        
        this.component = { templateName: 'myDialogTemplate' };
    })

    describe('creating a dialog', function() {
        beforeEach(function() {
            this.dialogOptions = { modal: true };
            this.createdDialog = this.$dialog.create(this.component, this.dialogOptions);
        })

        it('should have an open function', function() {
            expect(this.createdDialog.open).toBeAFunction();
        })

        it('should have a close function', function() {
            expect(this.createdDialog.open).toBeAFunction();
        })

        it('should add the close function as a closeDialog function to the component', function() {
            expect(this.component.closeDialog).toBe(this.createdDialog.close);
        })

        it('should have a close function that works without first showing dialog', function() {
            // Execute to ensure no errors
            this.createdDialog.close();
        })

        it('should have a component property that echoes passed-in component', function() {
            expect(this.createdDialog.component).toEqual(this.component);
        })

        it('should have an options property that echoes passed-in options, merged with defaults', function() {
            expect(this.createdDialog.options).toEqual(_.extend({}, this.$dialog.defaults(), this.dialogOptions));
        })

        it('should not show the dialog', function() {
            expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
        })

        it('should not add the component or its contents to page', function() {
            expect(document.getElementById('my-dialog-content')).toBeNull();
        })

        it('should set options to the defaults if they are passed as undefined', function() {
            expect(this.$dialog.create(this.component, undefined).options).toEqual(this.$dialog.defaults());
        })
    })

    describe('opening a dialog', function() {
        beforeEach(function() {
            this.createdDialog = this.$dialog.create(this.component);
            this.openPromise = this.createdDialog.open();
        })

        afterEach(function() {
            this.createdDialog.close();            
        })

        it('should show the dialog', function() {
            expect(document.getElementsByClassName('hx-dialog').length).toBe(1);
        })

        it('should use component to render dialog contents', function() {
            expect(document.getElementById('my-dialog-content')).not.toBeNull();
        })

        it('should return a promise', function() {
            expect(this.openPromise).toBeAPromise();
        })

        it('should add a dialog-open class to body', function() {
            expect(document.body).toHaveClass('dialog-open');
        })

        it('should set ARIA role to dialog', function() {
            expect(document.getElementsByClassName('hx-dialog')[0]).toHaveAttr('role', 'dialog');
        })

        describe('opening dialog twice, whilst previous still open', function() {
            beforeEach(function() {
                this.secondOpenPromise = this.createdDialog.open();
            })

            it('should return the same promise as first class', function() {
                expect(this.secondOpenPromise).toBe(this.openPromise);
            })

            it('should not render another dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(1);
            })
        })
    })

    describe('modal options', function() {
        describe('setting modal to false', function() {
            beforeEach(function() {
                this.createdDialog = this.$dialog.create(this.component, { modal: false });
                this.openPromise = this.createdDialog.open();
            })

            afterEach(function() {
                this.createdDialog.close();            
            })

            it('should not add hx-dialog__modal class', function() {
                expect(document.getElementsByClassName('hx-dialog')[0]).not.toHaveClass('hx-dialog__modal');
            })
        })

        describe('setting modal to true', function() {
            beforeEach(function() {
                this.createdDialog = this.$dialog.create(this.component, { modal: true });
                this.openPromise = this.createdDialog.open();
            })

            afterEach(function() {
                this.createdDialog.close();            
            })

            it('should add hx-dialog__modal class', function() {
                expect(document.getElementsByClassName('hx-dialog')[0]).toHaveClass('hx-dialog__modal');
            })
        })

    })

    describe('given an open dialog', function() {
        beforeEach(function() {
            this.onClose = this.spy();
            this.createdDialog = this.$dialog.create(this.component, { onClose: this.onClose });
            this.openPromise = this.createdDialog.open(); 
        })

        describe('closing a dialog in code', function() {
            beforeEach(function() {
                this.closeValue = 'This is the close value';
                this.createdDialog.close(this.closeValue);    
            })

            it('should hide the dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })

            it('should hide dialog contents', function() {
                expect(document.getElementById('my-dialog-content')).toBeNull();
            })

            it('should remove the dialog-open class from body', function() {
                expect(document.body).not.toHaveClass('dialog-open');
            })

            it('should resolve open promise with value passed to close', function() {
                expect(this.openPromise.state()).toBe('resolved');

                this.openPromise.done(function(resolvedValue) {
                    expect(resolvedValue).toBe(this.closeValue);
                }.bind(this))
            })

            it('should call onClose method of options', function() {
                expect(this.onClose).toHaveBeenCalledWith(this.closeValue);
            })
        })
    
        describe('closing a dialog using close button', function() {
            beforeEach(function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--close')[0], 'click');
            })

            it('should hide the dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })

            it('should hide dialog contents', function() {
                expect(document.getElementById('my-dialog-content')).toBeNull();
            })

            it('should resolve open promise', function() {
                expect(this.openPromise.state()).toBe('resolved');
            })
        })

        describe('closing a modal dialog by pressing ESC', function() {
            beforeEach(function() {
                $(document).trigger(jQuery.Event( 'keyup', { keyCode: 27 } ));
            })

            it('should hide the dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })

            it('should hide dialog contents', function() {
                expect(document.getElementById('my-dialog-content')).toBeNull();
            })

            it('should resolve open promise', function() {
                expect(this.openPromise.state()).toBe('resolved');
            })
        })
    })

    describe('managing focus', function() {
        beforeEach(function() {
            // HTML fixtures are hidden, so would not grab focus, so we add an input manually.
            // We need something specific in the page to have focus for this test, else activeElement
            // is body and is automatically reverted once the dialog is no longer visible
            this.focusedInput = document.createElement('input');
            this.focusedInput.id = 'input-outside-modal';
            document.body.appendChild(this.focusedInput);

            this.focusedInput.focus();

            this.currentFocusElement = document.activeElement;
            expect(document.activeElement.id).toBe('input-outside-modal');

            this.createdDialog = this.$dialog.create(this.component);
            this.openPromise = this.createdDialog.open();
        })

        afterEach(function() {
            this.createdDialog.close();
            this.focusedInput.parentNode.removeChild(this.focusedInput);            
        })

        it('should focus the dialog on open', function() {
            expect(document.activeElement).toBe(document.getElementsByClassName('hx-dialog')[0]);
        })

        it('should re-focus originally focused element on close', function() {
            this.createdDialog.close();  
            expect(document.activeElement.id).toBe(this.currentFocusElement.id);
        })
    })

    describe('with closeControls option set to false', function() {
        beforeEach(function() {
            this.createdDialog = this.$dialog.create(this.component, { closeControls: false });
            this.openPromise = this.createdDialog.open(); 
        })

        afterEach(function() {
            this.createdDialog.close();
        })

        it('should not show the close button', function() {
            expect(document.getElementsByClassName('hx-dialog--close')[0]).toBeHidden();
        })

        it('should not close dialog on esc key', function() {
            $(document).trigger(jQuery.Event( 'keyup', { keyCode: 27 } ));
            expect(document.getElementsByClassName('hx-dialog').length).toBe(1);
        })
    })

    describe('alert', function() {
        describe('with just message specified', function() {
            beforeEach(function() {
                this.alertPromise = this.$dialog.alert('This is my message');
            })

            afterEach(function() {
                if(document.getElementsByClassName('hx-dialog--ok')[0]) {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');
                }
            })

            it('should use alert message', function() {
                expect(document.getElementsByClassName('hx-dialog--message')[0]).toHaveText('This is my message');
            })

            it('resolve promise with true when OK button pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');

                expect(this.alertPromise.state()).toBe("resolved");
                this.alertPromise.done(function(v) {
                    expect(v).toBe(true);
                })
            })

            it('close dialog when OK button is pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })
        });

        describe('with fully overriden options', function() {
            beforeEach(function() {
                this.alertPromise = this.$dialog.alert({
                    title: 'My title', 
                    message: 'This is my message', 
                    okText: 'Ok Text',
                    cancelText: 'Cancel Text'
                });
            })

            afterEach(function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');
            })

            it('should use title text in header', function() {
                expect(document.getElementsByClassName('hx-dialog--title')[0]).toHaveText('My title');
            })

            it('should use alert message', function() {
                expect(document.getElementsByClassName('hx-dialog--message')[0]).toHaveText('This is my message');
            })

            it('should use OK button text', function() {
                expect(document.getElementsByClassName('hx-dialog--ok')[0]).toHaveText('Ok Text');
            })

            it('should not show the close button', function() {
                expect(document.getElementsByClassName('hx-dialog--close')[0]).toBeHidden();
            })

            it('should immediately open a modal dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(1);
            })
        })
    })

    describe('confirm', function() {
        describe('with just message specified', function() {
            beforeEach(function() {
                this.confirmPromise = this.$dialog.confirm('This is my message');
            })

            afterEach(function() {
                if(document.getElementsByClassName('hx-dialog--cancel')[0]) {
                    ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--cancel')[0], 'click');
                }
            })

            it('should use confirm message', function() {
                expect(document.getElementsByClassName('hx-dialog--message')[0]).toHaveText('This is my message');
            })

            it('resolve promise with true when OK button pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');

                expect(this.confirmPromise.state()).toBe("resolved");
                this.confirmPromise.done(function(v) {
                    expect(v).toBe(true);
                })
            })

            it('close dialog when OK button is pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--ok')[0], 'click');
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })

            it('resolve promise with false when Cancel button pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--cancel')[0], 'click');

                expect(this.confirmPromise.state()).toBe("resolved");
                this.confirmPromise.done(function(v) {
                    expect(v).toBe(false);
                })
            })

            it('close dialog when cancel button is pressed', function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--cancel')[0], 'click');
                expect(document.getElementsByClassName('hx-dialog').length).toBe(0);
            })
        })

        describe('with fully overriden text', function() {
            beforeEach(function() {
                this.confirmPromise = this.$dialog.confirm({
                    title: 'My title', 
                    message: 'This is my message', 
                    okText: 'Ok Text',
                    cancelText: 'Cancel Text'
                });
            })

            afterEach(function() {
                ko.utils.triggerEvent(document.getElementsByClassName('hx-dialog--cancel')[0], 'click');
            })

            it('should use title text in header', function() {
                expect(document.getElementsByClassName('hx-dialog--title')[0]).toHaveText('My title');
            })

            it('should use confirm message', function() {
                expect(document.getElementsByClassName('hx-dialog--message')[0]).toHaveText('This is my message');
            })

            it('should use OK button text', function() {
                expect(document.getElementsByClassName('hx-dialog--ok')[0]).toHaveText('Ok Text');
            })

            it('should use Cancel button text', function() {
                expect(document.getElementsByClassName('hx-dialog--cancel')[0]).toHaveText('Cancel Text');
            })

            it('should not show the close button', function() {
                expect(document.getElementsByClassName('hx-dialog--close')[0]).toBeHidden();
            })

            it('should immediately open a modal dialog', function() {
                expect(document.getElementsByClassName('hx-dialog').length).toBe(1);
            })
        })
    })
})