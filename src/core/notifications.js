/** @namespace $notifier */
hx.singleton('$notifier', '$bus', function($bus) {
    var notifications = {};

    /**
     * @name success
     * @memberOf $notifier#
     * @function
     *
     * @description
     * Raises a success level notification
     *
     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     *
     * @see $notifier#send
     */

    /**
     * @name warning
     * @memberOf $notifier#
     * @function
     *
     * @description
     * Raises a warning level notification
     *
     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     *
     * @see $notifier#send
     */

    /**
     * @name error
     * @memberOf $notifier#
     * @function
     *
     * @description
     * Raises an error level notification
     *
     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     *
     * @see $notifier#send
     */

    /**
      Namespace that provides a number of methods for publishing notifications, 
      messages that the system can listen to to provide feedback to the user
      in a consistent fashion.

      All messages that are published are within the `notification` namespace, with
      the second level name being the level of notification (e.g. `notification:success`).
      The data that is passed as arguments contains:
      * `text`: The text of the notification
      * `level`: The level of the notification (i.e. `success`, `warning` or `error`)
    */
    'success warning error'.replace(/\w+/g, function (level) {
        notifications[level] = function (text, options) {
            notifications.send(level, text, options);
        };
    });

    /**
     * @name send
     * @memberOf $notifier#
     * @function
     *
     * @description
     *
     * Raises a notification message, a message that can be standardised across
     * an application to provide a standard means of displaying notifications to
     * the user, for example to indicate a remote operation has succeeded or
     * failed.
     *
     * @param {string} level The level of the notification (e.g. success, or warning)
     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     */
    notifications.send = function(level, text, options) {
        $bus.publish("notification:" + level, {
            text: text,
            level: level,
            options: options || {}
        });
    }

    return notifications;
});