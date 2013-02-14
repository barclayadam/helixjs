var EventBus = function() {
    var clearAll, publish, subscribe, _subscribers;
    
    _subscribers = {};
    
    clearAll = function() {
        _subscribers = {};
    };

    /**
      Subscribes the given function to the specified messageName, being executed
      if the exact same named event is raised or a `namespaced` event published
      with a root of the given `messageName` (e.g. publishing a message with
      the name `myNamespace:myEvent` will call subscribers of both 
      `myNamespace:myEvent` and `myNamespace`).
     
      The return result from this function is a subscription, an object that
      has a single 'unsubscribe' method that, if called, will dispose of the
      subscription to the named event meaning no further events will be published
      to the given function.
    */
    subscribe = function(messageName, callback) {
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
        Publishes the given named message to any subscribed listeners, passing 
        the `messageData` argument on to each subscriber as an arguments to the 
        subscription call.
    
        (e.g. 
          subscribe "My Event", (messageData) ->
          publish   "My Event", messageData
        )
    */
    publish = function(messageName, args) {
        var indexOfSeparator, messages, msg, subscriber, t, _i, _len, _ref;

        if (args == null) {
            args = {};
        }

        hx.log.debug("Publishing " + messageName, args);
        
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
        return void 0;
    };

    return {
        clearAll: clearAll,
        subscribe: subscribe,
        publish: publish
    };
};

hx.EventBus = EventBus;
hx.bus = new hx.EventBus;