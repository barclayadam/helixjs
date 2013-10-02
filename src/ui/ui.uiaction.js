(function() {
    /**
     * Constructs a new `UI Action`, something that can be bound to in the UI using
     * the `action` binding handler to execute an action when the user clicks on
     * an element (e.g. a button).
     *
     * A UI action provides a number of benefits over just a simple function:
     *
     * * An action can have an associated `enabled` status that determines whether an action
     *   will be executed or not without having to wire this functionality in everytime. The
     *   `action` binding handler will automatically apply attributes to the attached element
     *   to allow UI feedback on the enabled status.
     *
     * * By using the `action` binding handler the status of execution can be automatically
     *   shown to the user visually as an `executing` observable exists that keeps track of
     *   the execution status of the action.
     *
     * A UI action can mark itself as a `disableDuringExecution` action, meaning that if the
     * action is asynchrounous the user can not execute the action multiple times in parallel,
     * which is particularly useful when submitting forms to the server.
     *
     * @param {object|function} funcOrOptions - The function to execute, or an options object
     * @param {function} funcOrOptions.action - [required] The function to execute
     * @param {function|observable} funcOrOptions.enabled - A function or observable that can
     *    be used to determine whether this action is enabled or not
     * @param {bool} funcOrOptions.disableDuringExecution - Determines whether or not
     *    to disable this action during execution, default to `true`
     * @param {any} funcOrOptions.context - The context (`this` value) the enabled (if supplied) and 
     * action functions will be bound to.
     * @return {function} A function that wraps the action passed in, and augments it with the
     * functionality as described above
     */
    function makeUiAction(funcOrOptions) {
        var action, disableDuringExecution, enabled, 
            executing = ko.observable(false);

        if (_.isFunction(funcOrOptions)) {
            enabled = ko.observable(true);
            action = funcOrOptions;
            disableDuringExecution = true;
        } else {
            enabled = hx.utils.asObservable(funcOrOptions.enabled != null ? funcOrOptions.enabled : true, funcOrOptions.context || this);
            disableDuringExecution = funcOrOptions.disableDuringExecution != null ? funcOrOptions.disableDuringExecution : false;
            action = funcOrOptions.action;
        }

        /**
         * Executes this UiAction.
         *
         * @method execute
         * @return {any} The result of executing this action
         */
        function execute() {
            var ret;

            if (enabled() && (!disableDuringExecution || !executing())) {
                executing(true);

                ret = action.apply(funcOrOptions.context || this, arguments);

                hx.utils.asPromise(ret).always(function () {
                    executing(false);
                });

                return ret;
            }
        };

        /**
         * isUiAction is used to test whether a function is a true UI Action, to be used within the binding 
         * handlers to allow automatic wrapping of normal functions as actions.
         *
         * @property isUiAction
         * @type bool
         * @default true
         */
        execute.isUiAction = true;

        /**
         * Determines whether or not this action is enabled, that when {@link execute} is called
         * it will be executed. 
         *
         * @property enabled
         * @type bool
         * @default true
         * @observable
         */
        execute.enabled = enabled;

        /**
         * Determines whether this action is currently executing, useful when binding to an async
         * action to be able to provide feedback to the user and to stop them attempting to execute
         * this action again.
         *
         * @property executing
         * @type bool
         * @observable
         */
        execute.executing = executing;

        /**
         * Determines whether or not this action should be disabled during execution, such that
         * executing the action again during an execution (async) will result in no processing
         * and an immediate return.
         *
         * @property disableDuringExecution
         * @type bool
         * @default false
         */
        execute.disableDuringExecution = disableDuringExecution;

        return execute;
    }

    hx.provide('$UiAction', function() {
        return makeUiAction;
    });

    function updateElementBasedOnUiAction(element, uiAction, shouldHide) {
        var isEnabled = uiAction.enabled(),
            isExecuting = uiAction.executing();

        if(isEnabled) {
            element.removeAttribute('disabled');
        } else {
            element.setAttribute('disabled', 'disabled')
        }

        if(shouldHide) {
            if(isEnabled) {
                element.style.display = ko.utils.domData.get(element, '__original_display') || '';
            } else {
                element.style.display = "none";
            }
        } 

        ko.utils.toggleDomNodeCssClass(element, 'is-executing', isExecuting);
    }

    function handleAction(event) {
        var element = event.target;

        do {        
            var elementAction = ko.utils.domData.get(element, '__action');

            if (elementAction && event.type === ko.utils.domData.get(element, '__actionEventType')) {
                elementAction();

                event.preventDefault();
            }

            element = element.parentNode;
        } while(element);
    }

    ko.utils.registerEventHandler(document, 'click', handleAction);
    ko.utils.registerEventHandler(document, 'submit', handleAction);
     
    /**
     * @bindingHandler action
     *
     * The action binding handler is used to execute a UiAction, registering a 'click'
     * event handler that will call the `execute` method of the ui action when the
     * element is clicked.
     *
     * To allow for styling, such as providing a loading spinner on a button when
     * the action is being executed (assuming it is async) an 'is-executing' class
     * is added during the processing of the ui action, with the execution status
     * being determined by the @{link UiAction.executing#} observable.
     *
     * In addition a 'disabled' attribute will be managed, depending on the value
     * of the ui action's enabled observable. If the action is enabled then no
     * attribute will be set, if disabled the 'disabled' attribute will have its
     * set to 'disabled', which can be targetted by CSS by using attribute selectors
     * (e.g. a[disabled] { color: red; }).
     *
     * The default behaviour of just adding the disabled attribute can be supplemented
     * with the ability to hide the element when it is no longer enabled (setting the CSS
     * `display` property to `none`) by adding another bindingHandler of `onDisabled` with
     * an argument of `'hide'`:
     *
     * @example
     *     <a id='action-link' data-bind='action: action, onDisabled: "hide"'>Execute Action</a>
     */
    hx.bindingHandler('action', {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var shouldHide = allBindingsAccessor()['onDisabled'] === 'hide',
                uiAction = valueAccessor(),
                isForm = element.tagName === 'FORM';

            if (!uiAction.isUiAction) {
                uiAction = makeUiAction({
                    action: uiAction,
                    context: viewModel
                });
            }

            ko.utils.domData.set(element, '__action', uiAction);
            ko.utils.domData.set(element, '__actionEventType', isForm ? 'submit' : 'click');

            if(shouldHide) {
                ko.utils.domData.set(element, '__original_display', element.style.display);
            }

            ko.computed(function() {
                updateElementBasedOnUiAction(element, uiAction, allBindingsAccessor()['onDisabled'] === 'hide');
            }, 
            { disposeWhenNodeIsRemoved: element });

            if(isForm) {
                // The actionSubmitDisplay binding handler needs access to the action on
                // its parent's form. Cannot modify binding context to take over descendant binding as needs
                // to work with other controlling binding handlers.         
                ko.utils.domData.set(element, '$formAction', uiAction);
            }         
        }
    });

    /** 
     * @bindingHandler
     * @internal
     *
     * A binding handler that will add the necessary 'display' elements as described in the `action`
     * binding handler in the case that the action binding handler has been applied on a form, affecting
     * buttons and inputs with type='submit'.
     *
     * This binding handler should not be applied manually, it is applied to all buttons automatically.
     */
    hx.bindingHandler('actionSubmitDisplay', {
        tag: ['button', 'input'],

        update: function(element, valueAccessor, allBindingsAccessor) {
            if(element.getAttribute('type') === 'submit' && !allBindingsAccessor()['action']) {
                var parentForm = element.parentNode;

                while(parentForm && parentForm.tagName !== 'FORM') {
                    parentForm = parentForm.parentNode;
                }

                if(parentForm) {
                    var formAction = ko.utils.domData.get(parentForm, '$formAction');

                    if(formAction) {
                        updateElementBasedOnUiAction(element, formAction, allBindingsAccessor()['onDisabled'] === 'hide');   
                    }
                }
            }
        }
    });
}());