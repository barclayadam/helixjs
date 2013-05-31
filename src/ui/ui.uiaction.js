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
 * @class UiAction
 * @constructor
 *
 * @param {object|function} funcOrOptions - The function to execute, or an options object
 * @param {function} funcOrOptions.action - [required] The function to execute
 * @param {function|observable} funcOrOptions.enabled - A function or observable that can
 *    be used to determine whether this action is enabled or not
 * @param {bool} funcOrOptions.disableDuringExecution - Determines whether or not
 *    to disable this action during execution, default to `true`
 * @param {any} funcOrOptions.context - The context (`this` value) the enabled (if supplied) and 
 * action functions will be bound to.
 */
hx.UiAction = function (funcOrOptions) {
    var action, disableDuringExecution, enabled, executing;

    if (_.isFunction(funcOrOptions)) {
        enabled = ko.observable(true);
        action = funcOrOptions;
        disableDuringExecution = false;
    } else {
        enabled = hx.utils.asObservable(funcOrOptions.enabled != null ? funcOrOptions.enabled : true, funcOrOptions.context || this);
        disableDuringExecution = funcOrOptions.disableDuringExecution != null ? funcOrOptions.disableDuringExecution : false;
        action = funcOrOptions.action;
    }

    /**
     * Determines whether or not this action is enabled, that when {@link execute} is called
     * it will be executed. 
     *
     * @property enabled
     * @type bool
     * @default true
     * @observable
     */
    this.enabled = enabled;

    /**
     * Determines whether this action is currently executing, useful when binding to an async
     * action to be able to provide feedback to the user and to stop them attempting to execute
     * this action again.
     *
     * @property executing
     * @type bool
     * @observable
     */
    this.executing = ko.observable(false);

    /**
     * Determines whether or not this action should be disabled during execution, such that
     * executing the action again during an execution (async) will result in no processing
     * and an immediate return.
     *
     * @property disableDuringExecution
     * @type bool
     * @default false
     */
    this.disableDuringExecution = disableDuringExecution;

    /**
     * Executes this UiAction.
     *
     * @method execute
     * @return {any} The result of executing this action
     */
    this.execute = function () {
        var ret, self = this;

        if (this.enabled() && (!this.disableDuringExecution || !this.executing())) {
            this.executing(true);

            ret = action.apply(funcOrOptions.context || this, arguments);

            hx.utils.asPromise(ret).then(function () {
                self.executing(false);
            });

            return ret;
        }
    };
};
 
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
koBindingHandlers.action = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var shouldHide = allBindingsAccessor()['onDisabled'] === 'hide';

        ko.utils.registerEventHandler(element, 'click', function() {
            valueAccessor().execute();
        })

        if(shouldHide) {
            ko.utils.domData.set(element, '__original_display', element.style.display);
        }
    },

    update: function(element, valueAccessor, allBindingsAccessor) {
        var isEnabled = valueAccessor().enabled(),
            isExecuting = valueAccessor().executing(),
            shouldHide = allBindingsAccessor()['onDisabled'] === 'hide';

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
};