/**
 * Constructs a new `UI Action`, something that can be bound to in the UI using
 * the `action` binding handler to execute an action when the user clicks on
 * an element (e.g. a button).
 *
 * A UI action provides a number of benefits over just a simple function:
 *
 * * An action can have an associated 'enabled' status that determines whether an action
 *   will be executed or not without having to wire this functionality in everytime. The
 *   `action` binding handler will automatically apply attributes to the attached element
 *   to allow UI feedback on the enabled status.
 *
 * * By using the `action` binding handler the status of execution can be automatically
 *   shown to the user visually as an `executing` observable exists that keeps track of
 *   the execution status of the action.
 *
 * A UI action can mark itself as a 'disableDuringExecution' action, meaning that if the
 * action is asynchrounous the user can not execute the action multiple times in parallel,
 * which is particularly useful when submitting forms to the server.
 *
 * @constructor
 *
 * @param {object|function} funcOrOptions - The function to execute, or an options object
 * @param {function} funcOrOptions.action - [required] The function to execute
 * @param {function|observable} funcOrOptions.enabled - A function or observable that can
 *    be used to determine whether this action is enabled or not
 * @param {bool} funcOrOptions.disableDuringExecution - Determines whether or not
 *    to disable this action during execution, default to `true`
 */
hx.UiAction = function (funcOrOptions) {
    var action, disableDuringExecution, enabled, executing;

    if (_.isFunction(funcOrOptions)) {
        enabled = ko.observable(true);
        action = funcOrOptions;
        disableDuringExecution = false;
    } else {
        enabled = hx.utils.asObservable(funcOrOptions.enabled != null ? funcOrOptions.enabled : true);
        disableDuringExecution = funcOrOptions.disableDuringExecution != null ? funcOrOptions.disableDuringExecution : false;
        action = funcOrOptions.action;
    }

    /**
     * Determines whether or not this action is enabled, that when {@link execute} is called
     * it will be executed. 
     *
     * @type {observable<bool>}
     */
    this.enabled = enabled;

    /**
     * Determines whether this action is currently executing, useful when binding to an async
     * action to be able to provide feedback to the user and to stop them attempting to execute
     * this action again.
     *
     * @type {observable<bool>}
     */
    this.executing = ko.observable(false);

    /**
     * Determines whether or not this action should be disabled during execution, such that
     * executing the action again during an execution (async) will result in no processing
     * and an immediate return.
     *
     * @type {bool}
     */
    this.disableDuringExecution = disableDuringExecution;


    /**
     * Executes this UiAction.
     *
     * @return {any} The result of executing this action
     */
    this.execute = function () {
        var ret, self = this;

        if (this.enabled() && (!this.disableDuringExecution || !this.executing())) {
            this.executing(true);

            ret = action.apply(this, arguments);

            hx.utils.asPromise(ret).then(function () {
                self.executing(false);
            });

            return ret;
        }
    };
};