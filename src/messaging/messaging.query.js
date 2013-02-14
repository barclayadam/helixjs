var messaging, _ref;

messaging = (_ref = hx.messaging) != null ? _ref : hx.messaging = {};

messaging.queryUrlTemplate = 'Query/{name}/?values={values}';

/**
 Executes a 'query', something that is simply defined as an AJAX call to a predefined
 URL that has the name and values of a query injected.

 The URL template that is used is defined by `hx.messaging.queryUrlTemplate`, with two
 placeholders that will be replaced:

 * `{name}`: Replaced by the value of `queryName` passed to this method
 * `{values}`: The JSON string encoded version of `options` that are passed to this method.

 This method returns a promise that will resolve with the value of the AJAX call.
*/
messaging.query = function (queryName, options) {
    if (options == null) {
        options = {};
    }

    hx.log.info("Executing query '" + queryName + "'.");

    return hx.ajax
    	.url(messaging.queryUrlTemplate.replace("{values}", encodeURIComponent(ko.toJSON(options)))
    	.replace("{name}", queryName))
    	.get();
};