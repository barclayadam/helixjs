hx.config('$templating', function($templating) {
    $templating.set('$hx-dialog',
        '<div class=hx-dialog tabindex=-1 role=dialog data-bind="css: { \'hx-dialog__modal\': options.modal }">' +
        '  <div class=hx-dialog--inner>' +
        '    <div data-bind="component: component, parameters: parameters, onComponentCreated: configureComponent" />' +
        '  </div>' +
        '' +
        '  <a href="#!" class=hx-dialog--close title=Close data-bind="click: cancel, visible: options.closeControls">×</a>' +
        '</div>'
    );

    $templating.set('$dialog-confirm',
        '<div class="hx-confirm-dialog" aria-labelledby="hx-dialog--title" aria-describedby="hx-dialog--message">' +
        ' <header class=hx-dialog--header>' +
        '  <h2 class="hx-dialog--title" id="hx-dialog--title" data-bind="text: title"></h2>' +
        ' </header>' +
        '' +
        ' <section class=hx-dialog--content>' +
        '  <p class="hx-dialog--message" id="hx-dialog--message" data-bind="text: message"></p>' +
        ' </section>' +
        '' +
        ' <footer class=hx-dialog--footer>' +
        '   <button class=hx-dialog--ok data-bind="click: function() { $root.close(true) }, text: okText"></button>' +
        '   <button class=hx-dialog--cancel data-bind="click: function() { $root.close(false) }, text: cancelText"></button>' +
        ' </footer>' +
        '</div>'
    );    

    $templating.set('$dialog-alert',
        '<div class="hx-alert-dialog" role="alertdialog" aria-labelledby="hx-dialog--title" aria-describedby="hx-dialog--message">' +
        ' <header class=hx-dialog--header>' +
        '  <h2 class="hx-dialog--title" id="hx-dialog--title" data-bind="text: title"></h2>' +
        ' </header>' +
        '' +
        ' <section class=hx-dialog--content>' +
        '  <p class="hx-dialog--message" id="hx-dialog--message" data-bind="text: message"></p>' +
        ' </section>' +
        '' +
        ' <footer class=hx-dialog--footer>' +
        '   <button class=hx-dialog--ok data-bind="click: function() { $root.close(true) }, text: okText"></button>' +
        ' </footer>' +
        '</div>'
    );   
});

hx.singleton('$dialog', function() {
    var currentlyShowingDialog,
        currentDialogElement,
        defaultOptions = {
            modal: true,
            canCancel: true,
            closeControls: true
        };

    ko.utils.registerEventHandler(document, 'keyup', function(e) {
        if (currentlyShowingDialog && e.keyCode === 27) {
            currentlyShowingDialog.cancel();
        }
    });

    ko.utils.registerEventHandler(document, 'click', function(e) {
        if (currentlyShowingDialog && e.target.getAttribute('role') === 'dialog' && e.target.className.indexOf('hx-dialog') !== -1) {
            currentlyShowingDialog.cancel();
        }
    });

    // We must use addEventListener as knockout can not specify capturing or not
    if (document.addEventListener) {
        document.addEventListener("focus", function(e) {
            if (currentlyShowingDialog && !ko.utils.domNodeIsContainedBy(e.target, currentDialogElement)) {
                e.stopPropagation();
                currentlyShowingDialog.focus();
            }

        }, true);
    };

    function Dialog(component, options) {
        var currentShowPromise,
            previouslyActiveElement;

        this.component = component;
        this.options = _.extend({}, defaultOptions, options);        
        this.parameters = this.options.parameters;

        this.configureComponent = function(createdComponent) {
            createdComponent.closeDialog = this.close.bind(this);
            createdComponent.cancelDialog = this.cancel.bind(this);
        }.bind(this);

        this.focus = function() {
            currentDialogElement.focus();            
        }

        /**
         * Opens this dialog.
         *
         * When opening a dialog a new DOM node will be appended to the body of the current document, with
         * the class `hx-dialog` (assuming the template has not been overriden). The component that has been
         * specified for this dialog will be rendered as the content of the dialog, rendered within a
         * containing DOM node with the class `hx-dialog--inner`.
         *
         * A promise will be returned from this function that will, when the dialog is closed, be resolved. The
         * `close` method takes a value that can be used to resolve this promise with.
         *
         * If the open method is executed when a dialog is already open then the previous promise will
         * be returned, and no further action will be taken.
         *
         * @returns {promise} A promise that will be resolved when this dialog is closed.
         */
        this.open = function() {
            if (currentShowPromise) {
                return currentShowPromise;
            }

            // Render template
            var dialogContainer = document.createElement('div');
            ko.renderTemplate('$hx-dialog', this, {}, dialogContainer, 'replaceChildren');

            // Use the first child, so as to avoid having an empty div wrapper
            currentDialogElement = dialogContainer.firstChild;
            document.body.appendChild(currentDialogElement);

            // Manage focus
            previouslyActiveElement = document.activeElement;
            currentDialogElement.focus();

            // Add a class to body, which can be used as styling hooks if necessary
            ko.utils.toggleDomNodeCssClass(document.body, 'dialog-open', true);

            currentlyShowingDialog = this;
            
            return currentShowPromise = new $.Deferred();
        };

        function closeCurrentDialog() { 
            if (currentDialogElement) {
                currentDialogElement.parentNode.removeChild(currentDialogElement);

                if (previouslyActiveElement) {
                    previouslyActiveElement.focus();
                }

                ko.utils.toggleDomNodeCssClass(document.body, 'dialog-open', false);

                previouslyActiveElement = null;
                currentShowPromise = null;
                currentDialogElement = null;

                currentlyShowingDialog = null;
            }
        }

        /**
         * Cancels this dialog, hiding the dialog but not resolving the promise and therefore never
         * handling any sort of return.
         */
        this.cancel = function() {
            if (this.options.canCancel) {
                closeCurrentDialog();
            }
        }

        /**
         * Closes the dialog, resolving the promise that had been created previously in the `show`
         * function.
         *
         * Optionally a value may be passed to this function that will be used when resolving the promise
         * to allow passing a value back to the originator, the client that opened this dialog instance.
         *
         * @param {any} closeValue The value used when resolving the open promise, optional
         */
        this.close = function(closeValue) {
            if (currentDialogElement) {
                if (currentShowPromise) {
                    currentShowPromise.resolve(closeValue);
                }
                
                if (this.options.onClose) {
                    this.options.onClose(closeValue);
                }
            }

            closeCurrentDialog();
        }.bind(this);
    }

    return {

        /**
         * Gets or sets the global defaults that will apply to all dialogs when created,
         */
        defaults: function(newOptions) {
            if(!newOptions) {
                return defaultOptions;
            } else {
                defaultOptions = newOptions;
            }
        },

        /**
         * Creates a new dialog, using the specified component and options.
         *
         * This will *not* open the dialog. To open a dialog the `open` function
         * should be called on the returned instance.
         *
         * @param {any} component The component to load as content, which can be any
         *  supported value that the `component` binding handler takes
         * @param {object} options An objects object to affect behaviour of thie dialog.
         */
        create: function(component, options) {
            return new Dialog(component, options);
        },

        /**
         * A convienience method of creating a modal confirmation dialog, a dialog that presents 
         * the user with a message and two buttons that allow for confirming or denying an action.
         *
         * This method will immediately open the dialog and return the promise that will be resolved with
         * either `true` or `false`, depending on what button the user pressed.
         *
         * If this method is called with a `string`, then that will be used as the message, with all
         * other options being defaults. Otherwise, in the case of an object being passed, that will be used to
         * allow overriding any option.
         */
        confirm: function(options) {
            var defaultOptions = { modal: true, closeControls: false, canCancel: true };

            if(_.isString(options)) {
                options = {
                    message: options
                };
            }

            options = _.extend({}, defaultOptions, options); 

            var component = {
                    templateName: '$dialog-confirm',

                    title: options.title || '', 
                    message: options.message || '',
                    okText: options.okText || 'Ok',
                    cancelText: options.cancelText || 'Cancel'
                },
                dialog = new Dialog(component, options);

            return dialog.open();
        },

        /**
         * A convienience method of creating a modal alert dialog, a dialog that presents 
         * the user with a message and a single button that would close the dialog.
         *
         * This method will immediately open the dialog and return the promise that will be resolved with
         * when the user presses the 'ok' button.
         *
         * If this method is called with a `string`, then that will be used as the message, with all
         * other options being defaults. Otherwise, in the case of an object being passed, that will be used to
         * allow overriding any option.
         */
        alert: function(options) {
            var defaultOptions = { modal: true, closeControls: false, canCancel: false };

            if(_.isString(options)) {
                options = {
                    message: options
                };
            }

            options = _.extend({}, defaultOptions, options); 

            var component = {
                    templateName: '$dialog-alert',

                    title: options.title || '', 
                    message: options.message || '',
                    okText: options.okText || 'Ok'
                },
                dialog = new Dialog(component, options);

            return dialog.open();
        }
    }
})