hx.singleton('$notifier', '$bus', function($bus) {
    var notifications = {};

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
            if (options == null) {
                options = {};
            }

            $bus.publish("notification:" + level, {
                text: text,
                level: level,
                options: options
            });
        };
    });

    return notifications;
});