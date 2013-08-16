hx.config('$templating', function($templating) {
    $templating.set('$hx-dialog',
        '<div class=hx-dialog tabindex=-1 role=dialog data-bind="css: { \'hx-dialog__modal\': options.modal }">' +
        '  <div class=hx-dialog--inner>' +
        '    <div class=hx-dialog--content data-bind="component: component" />' +
        '  </div>' +
        '' +
        '  <a href="#!" class=hx-dialog--close title=Close data-bind="click: close, visible: options.closeControls">×</a>' +
        '</div>'
    );

    $templating.set('$dialog-confirm',
        '<div class=hx-confirm-dialog>' +
        ' <header>' +
        '  <h2 class=hx-dialog--title data-bind="text: title"></h2>' +
        ' </header>' +
        '' +
        '  <p class=hx-dialog--message data-bind="text: message"></p>' +
        '' +
        ' <footer>' +
        '   <button class=hx-dialog--ok data-bind="click: function() { $root.close(true) }, text: okText"></button>' +
        '   <button class=hx-dialog--cancel data-bind="click: function() { $root.close(false) }, text: cancelText"></button>' +
        ' </footer>' +
        '</div>'
    );    

    $templating.set('$dialog-alert',
        '<div class=hx-alert-dialog>' +
        ' <header>' +
        '  <h2 class=hx-dialog--title data-bind="text: title"></h2>' +
        ' </header>' +
        '' +
        '  <p class=hx-dialog--message data-bind="text: message"></p>' +
        '' +
        ' <footer>' +
        '   <button class=hx-dialog--ok data-bind="click: function() { $root.close(true) }, text: okText"></button>' +
        ' </footer>' +
        '</div>'
    );   
});

hx.provide('$dialog', function() {
    var currentlyShowingDialog,
        defaultOptions = {
            modal: true,
            closeControls: true
        };

    ko.utils.registerEventHandler(document, 'keyup', function(e) {
        if (currentlyShowingDialog && currentlyShowingDialog.options.closeControls) {
            if (e.keyCode === 27) {
                currentlyShowingDialog.close();
            }
        }
    });

    function Dialog(component, options) {
        var currentShowPromise,
            currentDialogElement,
            previouslyActiveElement;

        this.component = component;
        this.options = _.extend({}, defaultOptions, options);

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
            if(currentShowPromise) {
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

            // Add a class to body, which can be used to styling hooks if necessary
            ko.utils.toggleDomNodeCssClass(document.body, 'dialog-open', true);

            currentlyShowingDialog = this;
            
            return currentShowPromise = new $.Deferred();
        };

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
            if(currentDialogElement) {
                currentDialogElement.parentNode.removeChild(currentDialogElement);

                currentShowPromise.resolve(closeValue);

                if(previouslyActiveElement) {
                    previouslyActiveElement.focus();
                }

                ko.utils.toggleDomNodeCssClass(document.body, 'dialog-open', false);

                previouslyActiveElement = null;
                currentShowPromise = null;
                currentDialogElement = null;

                currentlyShowingDialog = null;
            }
        };
        
        this.component.closeDialog = this.close;
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
            if(_.isString(options)) {
                options = {
                    message: options
                };
            }

            var component = {
                    templateName: '$dialog-confirm',

                    title: options.title || '', 
                    message: options.message || '',
                    okText: options.okText || 'Ok',
                    cancelText: options.cancelText || 'Cancel'
                },
                dialog = new Dialog(component, { modal: true, closeControls: false });

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
            if(_.isString(options)) {
                options = {
                    message: options
                };
            }

            var component = {
                    templateName: '$dialog-alert',

                    title: options.title || '', 
                    message: options.message || '',
                    okText: options.okText || 'Ok'
                },
                dialog = new Dialog(component, { modal: true, closeControls: false });

            return dialog.open();
        }
    }
})