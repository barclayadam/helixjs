/**
 * An authoriser provides the ability to authorise a component, with the default
 * implementation simply delegating the authorisation to the individual components
 * being authorised.
 *
 * If a component has an `isAuthorised` method then it will be called, with a set
 * of parameters (which would be the routing parameters, either form the current URL or
 * from a set of parameters that are used to generate a route). The implementation of 
 * the `isAuthorised` is completely app-dependent, although the result should be one of the 
 * following
 *
 * * [true|false] - A boolean indicating success or failure of the authorisation
 * * [promise] - A promise that will resolve (never reject) to a boolean value indicating
 *    success or failure of the authorisation
 */
hx.provide('$authoriser', function() {
    function authorise(component, parameters) {
        if(component.isAuthorised) {
            // isAuthorised should return either true / false directly, or a promise that
            // resolves to true / false.
            //
            // If `undefined` is returned, we will convert that to a `true` result.
            return Promise.resolve(component.isAuthorised(parameters))
                .then(function(result) {
                    return result !== false;
                });
        }

        // Resolve immediately, nothing to wait for
        return Promise.resolve(true);    
    }

    return {
        authorise: authorise,

        authoriseAll: function(components, parameters) {
            var authorisationPromises = _.map(components, function(c) { return authorise(c, parameters) });

            return Promise.all(authorisationPromises)
                .then(function(authorisations) {
                    return _.every(authorisations, function(a) { return a; });
                })
        },

        authoriseAny: function(components, parameters) {
            var authorisationPromises = _.map(components, function(c) { return authorise(c, parameters) });

            return Promise.all(authorisationPromises)
                .then(function(authorisations) {
                    return _.some(authorisations, function(a) { return a; });
                })
        }        
    }
});