var homepageViewModel = 
{ 
    templateName: 'homepage', 

    show: function() {
        this.myName = nerddinner.app.router.currentParameters.name || 'You';
    }
};

nerddinner.app.router.route('Homepage', '/examples/nerddinner/', { 'main': homepageViewModel });