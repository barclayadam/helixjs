hx.singleton('$ajax', ['$bus'], function($bus) {
    /*
     Used to store any request promises that are executed, to
     allow the `hx.ajax.listen` function to capture the promises that
     are executed during a function call to be able to generate a promise
     that is resolved when all requests have completed.
    */
    var requestDetectionFrame = [],
        listening = false;

    function parseResponseHeaders(headerStr) {
        if (!headerStr) {
            return {};
        }

        var headers = {},
            headerPairs = headerStr.split('\u000d\u000a');

        for (var i = 0; i < headerPairs.length; i++) {
            var headerPair = headerPairs[i];

            // Can't use split() here because it does the wrong thing
            // if the header value has the string ": " in it.
            var index = headerPair.indexOf('\u003a\u0020');

            if (index > 0) {
              var key = headerPair.substring(0, index);
              var val = headerPair.substring(index + 2);
              headers[key] = val;
            }
        }

        return headers;
    }

    function doCall(httpMethod, requestBuilder) {
        /*
            TODO: Extract extension of deferred to give non-failure
            handling semantics that could be used elsewhere.
        */
        var ajaxRequest, failureHandlerRegistered, getDeferred, promise, requestOptions;

        getDeferred = $.Deferred();
        promise = getDeferred.promise();

        failureHandlerRegistered = false;

        requestOptions = _.defaults(requestBuilder.properties, {
            url: requestBuilder.url,
            type: httpMethod
        });

        ajaxRequest = $.ajax(requestOptions);

        $bus.publish("ajaxRequestSent:" + requestBuilder.url, {
            path: requestBuilder.url,
            method: httpMethod
        });

        ajaxRequest.done(function (response, textStatus, jqXHR) {
            $bus.publish("ajaxResponseReceived:success:" + requestBuilder.url, {
                path: requestBuilder.url,
                method: httpMethod,
                response: response,
                status: 200,
                success: true,
                headers: parseResponseHeaders(jqXHR.getAllResponseHeaders())
            });

            return getDeferred.resolve(response);
        });

        ajaxRequest.fail(function (response) {
            var failureMessage = {
                path: requestBuilder.url,
                method: httpMethod,
                responseText: response.responseText,
                status: response.status,
                success: false,
                headers: parseResponseHeaders(response.getAllResponseHeaders())
            };

            $bus.publish("ajaxResponseReceived:failure:" + requestBuilder.url, failureMessage);

            if (!failureHandlerRegistered) {
                $bus.publish("ajaxResponseFailureUnhandled:" + requestBuilder.url, failureMessage);
            }

            return getDeferred.reject(response);
        });

        promise.fail = function(callback) {
              failureHandlerRegistered = true;

              return getDeferred.fail(callback);
        };

        promise.then = function(success, failure) {
              failureHandlerRegistered = failureHandlerRegistered || (failure != null);

              return getDeferred.then(success, failure);
        };

        if (listening) {
            requestDetectionFrame.push(promise);
        }

        return promise;
    };

    /** 
     * A RequestBuilder is used to compose a remote resource request (e.g. a GET
     * or POST request), allowing various actors to supply details of a request such
     * as its data, or headers, and then the execution of said request, with
     * built-in messaging and extension points for handling cross-cutting concerns
     * such as auditing or authentication & authorisation.
     *
     * @param {string} url The URL to which a request will be made
     * @constructor
     */
    function RequestBuilder(url) {
        this.url = url;
        this.properties = {};
    }

    /**
     * Sets the data for this request, which should be an object
     * of key-value pairs that will be sent with the request.
     */
    RequestBuilder.prototype.data = function(data) {
        this.properties.data = ko.toJSON(data);
        return this;
    };

    /**
     * Performs a GET request. 
     */
    RequestBuilder.prototype.get = function() {
        return doCall('GET', this);
    };

    /**
     * Performs a POST request. 
     */
    RequestBuilder.prototype.post = function() {
        return doCall('POST', this);
    };

    /**
     * Performs a PUT request. 
     */
    RequestBuilder.prototype.put = function() {
        return doCall('PUT', this);
    };

    /**
     * Performs a DELETE request. 
     */
    RequestBuilder.prototype["delete"] = function() {
        return doCall('DELETE', this);
    };

    /** @namespace $ajax  */
    return {
        /**
         * Entry point to the AJAX API, which begins the process
         * of 'building' a call to a server using an AJAX call. This
         * method returns a `request builder` that has a number of methods
         * on it that allows further setting of data, such as query
         * strings (if not already supplied), form data and content types.
         *  
         * The AJAX API is designed to provide a simple method of entry to
         * creating AJAX calls, to allow composition of calls if necessary (by
         * passing the request builder around), and to provide the familiar semantics
         * of publishing events as used extensively throughout `HelixJS`.
         *
         * @param {string} url The URLrepresenting the remote resource to contact
         * @returns {RequestBuilder}
         *
         * @memberOf $ajax
         */
        url: function(url) {
            return new RequestBuilder(url);
        },

        /**
         * Provides a way of listening to all AJAX requests during the execution
         * of a method and executing a callback based on the result of all those
         * captured requests.
         *
         * In the case where multiple requests are executed the method returns the 
         * `promise` that tracks the aggregate state of all requests. The method will 
         * resolve this `promise` as soon as all the requests resolve, or reject the 
         * `promise` as one of the requests is rejected. 
         *
         * If all requests are successful (resolved), the `done` / `then` callbacks will
         * be resolved with the values of all the requests, in the order they were
         * executed.
         *
         * In the case of multiple requests where one of the requests fails, the failure
         * callbacks of the returned `promise` will be immediately executed. This means
         * that some of the AJAX requests may still be 'in-flight' at the time of
         * failure execution.
         *
         * @param {function} f The function that will be executed
         * @return {promise} A promise to be fulfilled when all child AJAX requests
         * have been completed
         *
         * @memberOf $ajax
         */
        listen: function(f) {
            // Ensure we do not pick up previous requests.

            var allFinishedPromise;
            requestDetectionFrame = [];

            listening = true;
            f();
            listening = false;

            allFinishedPromise = $.when.apply(this, requestDetectionFrame);

            allFinishedPromise.then(function() {
                requestDetectionFrame = [];
            });

            return allFinishedPromise;
        }
    }
});