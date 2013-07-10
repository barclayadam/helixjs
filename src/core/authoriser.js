/**
 * An authoriser provides the ability to authorise a component, with the default
 * implementation simply delegating the authorisation to the individual components
 * being authorised.
 *
 * If a component has an `isAuthorised` method then it will be called, with a set
 * of parameters (which would be the routing parameters, either form the current URL or
 * from a set of parameters that are used to generate a route), and a second parameter of
 * `callback`. The implementation of the `isAuthorised` is completely app-dependent, although
 * the result should be one of the following
 *
 * * [true|false] - A boolean indicating success or failure of the authorisation
 * * [promise] - A promise that will resolve (never reject) to a boolean value indicating
 *    success or failure of the authorisation
 * * [undefined] - Return nothing if the `callback` function will be called, being called
 *    with a boolean indicating success or failure of the authorisation
 */
hx.provide('$authoriser', function() {
    function authorise(component, parameters) {
        var authorizedDeferred = new jQuery.Deferred(),
            handleResult = function(r) {
                authorizedDeferred[r === false ? 'reject' : 'resolve']();
            };

        if(component.isAuthorised) {
            var result = component.isAuthorised(parameters, handleResult);

            if(result !== undefined) {
                hx.utils.asPromise(result)
                    .then(handleResult, function() { authorizedDeferred.reject(); });
            }
        } else {
            // Resolve immediately, nothing to wait for
            authorizedDeferred.resolve();
        }

        return authorizedDeferred;        
    }

    return {
        authorise: authorise,

        authoriseAll: function(components, parameters) {
            var authorisationPromises = _.map(components, function(c) { return authorise(c, parameters) });

            return jQuery.when.apply(this, authorisationPromises);
        },

        authoriseAny: function(components, parameters) {
            var authorisationPromises = _.map(components, function(c) { return authorise(c, parameters) }),
                rejectedCount = 0,
                masterPromise = new jQuery.Deferred();

            function handleResolve() {
                masterPromise.resolve()
            }

            function handleReject() {
                if(masterPromise.state() === 'pending') {
                    rejectedCount = rejectedCount + 1;

                    if(rejectedCount === authorisationPromises.length) {
                        masterPromise.reject();
                    }
                }
            }

            _.each(authorisationPromises, function(a) {
                a.then(handleResolve, handleReject);
            });

            return masterPromise.promise();
        }        
    }
});