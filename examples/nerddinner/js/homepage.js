hx.provide('$homepage', ['$router'], function($router) {
    return { 
            templateName: 'homepage', 

            show: function() {
                this.myName = $router.currentParameters.name || 'You';
            }
        };

});

hx.config('$router', function($router) {
    $router.route('Homepage', '/examples/nerddinner/', { 'main': '$homepage' });
})