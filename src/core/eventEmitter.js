/**
 * @class $EventEmitter
 */

hx.provide('$EventEmitter', ['$log'], function($log) {
    var subscribers = {};
    
    function clearAll() {
        subscribers = {};
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
        if (_.isArray(messageName)) {
            for (var i = 0; i < messageName.length; i++) {
                subscribe(messageName[i], callback);
            }
        } else {
            subscriberList = subscribers[messageName] = subscribers[messageName] || { length: 0 };
            subscriberList.length = subscriberList.length + 1;

            var newToken = subscriberList.length;
            subscriberList[newToken] = callback;
          
            return {
                unsubscribe: function() {
                    return delete subscriberList[newToken];
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
        if (args == null) { args = {}; }

        $log.debug("Publishing " + messageName, args);
        
        var indexOfSeparator = -1,
            messages = [messageName];
        
        while (messageName = messageName.substring(0, messageName.lastIndexOf(':'))) {
            messages.push(messageName);
        }
        
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i],
                subscriberList = subscribers[msg] || {};
        
            for (var token in subscriberList) {
                if (token != 'length') {
                    subscriber = subscriberList[token];
                    subscriber.call(this, args);
                }
            }
        }
    };

    return {
        clearAll: clearAll,
        subscribe: subscribe,
        publish: publish,

        mixin: function(obj) {
            obj.subscribe = subscribe
        }
    };
});

hx.provide('$bus', hx.get('$EventEmitter'));