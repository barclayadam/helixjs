hx.provide('otherPage', function() {
    return { 
            templateName: 'otherPage'
        };

});

hx.config('$router', function($router) {
    $router.route('Other Page', '/examples/nerddinner/other', { 'main': 'otherPage' });
})