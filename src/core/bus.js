/**
 * @class $EventBus
 */

hx.provide('$EventBus', ['$log'], function($log) {
    var _subscribers = {};
    
    function clearAll() {
        _subscribers = {};
    };

    /**
     * Subscribes the given function to the specified messageName, being executed
     * if the exact same named event is raised or a `namespaced` event published
     * with a root of the given `messageName` (e.g. publishing a message with
     * the name `myNamespace:myEvent` will call subscribers of both 
     * `myNamespace:myEvent` and `myNamespace`).
     * 
     * The return result from this function is a subscription, an object that
     * has a single 'unsubscribe' method that, if called, will dispose of the
     * subscription to the named event meaning no further events will be published
     * to the given function.
     * 
     * @param {string} messageName The name of the message to subscribe to.
     * @param {function} callback The function to be executed when a message of
     * the specified name is published
     *
     * @memberOf $EventBus#
     */
    function subscribe(messageName, callback) {
        var message, newToken, _i, _len;

        if (_.isArray(messageName)) {
            for (_i = 0, _len = messageName.length; _i < _len; _i++) {
                message = messageName[_i];
                subscribe(message, callback);
            }
        } else {
            if (_subscribers[messageName] === void 0) {
                _subscribers[messageName] = {};
            }

            newToken = _.size(_subscribers[messageName]);
            _subscribers[messageName][newToken] = callback;
          
            return {
                unsubscribe: function() {
                    return delete _subscribers[messageName][newToken];
                }
            };
        }
    };

    /**
     * Publishes the given named message to any subscribed listeners, passing 
     * the `messageData` argument on to each subscriber as an arguments to the 
     * subscription call.
     * 
     * (e.g. 
     *   subscribe "My Event", (messageData) ->
     *   publish   "My Event", messageData
     * )
     * 
     * @param {string} messageName The name of the message to publish
     * @param {object} args The arguments that should be passed to any subscribers
     *
     * @memberOf $EventBus#
    */
    function publish(messageName, args) {
        var indexOfSeparator, messages, msg, subscriber, t, _i, _len, _ref;

        if (args == null) {
            args = {};
        }

        $log.debug("Publishing " + messageName, args);
        
        indexOfSeparator = -1;
        messages = [messageName];
        
        while (messageName = messageName.substring(0, messageName.lastIndexOf(':'))) {
            messages.push(messageName);
        }
        
        for (_i = 0, _len = messages.length; _i < _len; _i++) {
            msg = messages[_i];
            _ref = _subscribers[msg] || {};
        
            for (t in _ref) {
                subscriber = _ref[t];
                subscriber.call(this, args);
            }
        }
    };

    return {
        clearAll: clearAll,
        subscribe: subscribe,
        publish: publish
    };
});

hx.provide('$bus', hx.get('$EventBus'));