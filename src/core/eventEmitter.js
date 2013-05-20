/**
 * Provides eventing / messaging semantics that is exposed as a global `$bus` module, in addition
 * to being available as a mixin to provide local eventing semantics.
 *
 * If an object requires the ability to raise local events that can be subscribed to they
 * should depend on an `$EventEmitter` and then uses its `mixin` function:
 *
 *     hx.provide('MyClass', ['$EventEmitterFactory'], function($EventEmitterFactory) {
 *         function MyClass() {
 *             $EventEmitterFactory.mixin(this);
 *         }
 *
 *         MyClass.prototype.doSomething = function(arg1, arg2) {
 *             this.publish('anInterestingEvent', { arg1: arg1, arg2: arg2 });  
 *         }    
 *          
 *          return MyClass;     
 *     })
 *
 * @class $EventEmitter
 */
hx.provide('$EventEmitterFactory', ['$log'], function($log) {
    function $EventEmitterFactory() {
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
         * @method subscribe
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
         * the `payload` argument on to each subscriber as an argument to the 
         * subscription call.
         * 
         * @example 
         *     myEventEmitter.subscribe("My Event", function (payload) {});
         *     myEventEmitter.publish("My Event", { aProperty: 'A Value' });
         * 
         * @param {string} messageName The name of the message to publish
         * @param {object} payload The message payload that should be passed to any subscribers
         *
         * @method publish
         */
        function publish(messageName, payload) {
            if (payload == null) { payload = {}; }

            $log.debug("Publishing " + messageName, payload);
            
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
                        subscriber.call(this, payload);
                    }
                }
            }
        };

       
        return {
            clearAll: clearAll,
            subscribe: subscribe,
            publish: publish
        }
    }

    $EventEmitterFactory.mixin = function(obj) {
        var eventEmitter = $EventEmitterFactory();
        
        obj.subscribe = eventEmitter.subscribe;
        obj.$publish = eventEmitter.publish;

        return eventEmitter;
    }

    return $EventEmitterFactory;
});

hx.provide('$bus', hx.get('$EventEmitterFactory')());