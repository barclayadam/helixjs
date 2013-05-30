 describe('$authoriser', function () {
    var $router = hx.get('$router'),
        $authoriser = hx.get('$authoriser');

    beforeEach(function () {
        this.component = {
            isAuthorised: this.stub()
        };
    });

    it('should pass the current routes values as parameters to the isAuthorised method', function() {
        $router.currentParameters = { aValue: 1 };

        $authoriser.authorise(this.component);

        expect(this.component.isAuthorised).toHaveBeenCalledWith($router.currentParameters);
    })

    it('should handle returning true', function() {
        this.component.isAuthorised = function(parameters, callback) { return true; };

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(true);
        })
    })

    it('should handle returning false', function() {
        this.component.isAuthorised = function(parameters, callback) { return false; };

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(false);
        })
    })

    it('should handle returning promise that resolves to false', function() {
        var deferred = jQuery.Deferred();
        deferred.resolve(false);

        this.component.isAuthorised.returns(deferred.promise());

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(false);
        })
    })

    it('should handle returning promise that resolves to true', function() {
        var deferred = jQuery.Deferred();
        deferred.resolve(true);

        this.component.isAuthorised.returns(deferred.promise());

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(true);
        })
    })

    it('should handle returning undefined, but calling the callback function with false', function() {
        this.component.isAuthorised = function(parameters, callback) { callback(false); };

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(false);
        })
    })

    it('should handle returning undefined, but calling the callback function with true', function() {
        this.component.isAuthorised = function(parameters, callback) { callback(true); };

        $authoriser.authorise(this.component).done(function(result) {
            expect(result).toBe(true);
        })
    })
});