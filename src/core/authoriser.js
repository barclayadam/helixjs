hx.provide('$authoriser', ['$router'], function($router) {
    return {
        authorise: function(component) {
            var authorizedDeferred = new jQuery.Deferred()

            if(component.isAuthorised) {
                var result = component.isAuthorised($router.currentParameters, authorizedDeferred.resolve);

                if(result !== undefined) {
                    authorizedDeferred = hx.utils.asPromise(component.isAuthorised($router.currentParameters));
                }
            } else {
                // Resolve immediately, nothing to wait for
                authorizedDeferred.resolve();
            }

            return authorizedDeferred;
        }
    }
});