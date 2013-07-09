/**
 * @class $Notifier
 * @static
 */
hx.singleton('$notifier', '$bus', function($bus) {
    var notifications = {};

    /**
     * Raises a success level notification
     *
     * @member success

     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     *
     * @see $notifier#send
     */

    /**
     * Raises a warning level notification
     *
     * @member warning

     * @param {string} text The text to include in the notification
     * @param {object} options Options to pass as part of the notification, free-form
     *
     * @see $notifier#send
     */

    /**
     * Raises an error level notification
     *
     * @member error

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
     * Raises a notification message, a message that can be standardised across
     * an application to provide a standard means of displaying notifications to
     * the user, for example to indicate a remote operation has succeeded or
     * failed.

     * @member send
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
    };

    /**
     * Subscribes the given callback to any notifications that are raised from here.
     *
     * The callback receives the same message data that is published directly to the
     * `$bus`.
     *
     * @param {function} callback The function that will be executed when any notifications
     * are raised
     */
    notifications.subscribe = function(callback) {
        $bus.subscribe('notification', callback);
    };

    return notifications;
});