describe('router binding handler', function () {
    var $router = hx.get('$router'),
        $injector = hx.get('$injector');
        $templating = hx.get('$templating');

    beforeEach(function () {
        this.routePathStub = this.stub(hx.get('$location'), 'routePath');

        this.routeCallback = this.stub();
        $router.route({ name: 'Callback Only', url: '/Callback Only', callback: this.routeCallback });

        $templating.set('my-route-template', '<div id=my-route-template-div>This is the route only template</div>');
        $router.route({ name: 'Template Only', url: '/Template Only', templateName: 'my-route-template' });

        $templating.set('my-route-component', '<div id=my-route-component-div>This is the component template</div>');
        $injector.provide('my-route-component', {});
        $router.route({ name: 'Component', url: '/Component', component: 'my-route-component' });

        this.setHtmlFixture('<div id=router-div data-bind="router: {}"></div>');
        this.applyBindingsToFixture();
    });

    describe('Route with callback only', function () {
        beforeEach(function () {
            $router.navigateTo('Callback Only');
        });

        it('should not render anything in the element', function() {
            expect(document.getElementById('router-div')).toBeEmpty();
        });

        it('should clear the element if navigating to a route with just a callback', function() {
            $router.navigateTo('Template Only');
            $router.navigateTo('Callback Only');

            expect(document.getElementById('router-div')).toBeEmpty();
        });
    });

    describe('Route with template only', function () {
        beforeEach(function () {
            $router.navigateTo('Template Only');
        });

        it('should render the template', function() {
            expect(document.getElementById('router-div')).not.toBeEmpty();
            expect(document.getElementById('my-route-template-div')).toBeVisible();
        });
    });

    describe('Route with component', function () {
        beforeEach(function () {
            $router.navigateTo('Component');
        });

        it('should render the component', function() {
            expect(document.getElementById('router-div')).not.toBeEmpty();
            expect(document.getElementById('my-route-component-div')).toBeVisible();
        });
    });
});