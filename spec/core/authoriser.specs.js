 describe('$authoriser', function () {
    var $router = hx.get('$router'),
        $authoriser = hx.get('$authoriser');

    function shouldHaveResolved(promise) {
        expect(promise.state()).toEqual("resolved");
    }

    function shouldHaveRejected(promise) {
        expect(promise.state()).toEqual("rejected");
    }

    function resolvedPromise(resolveValue) {
       var deferred = jQuery.Deferred();
       deferred.resolve(resolveValue);

       return deferred;
    }

    describe('single component to authorise', function() {
        beforeEach(function () {
            this.component = {
                isAuthorised: this.stub()
            };
        });

        it('should pass the current routes values as parameters to the isAuthorised method', function() {
            $authoriser.authorise(this.component, { aValue: 1 });

            expect(this.component.isAuthorised).toHaveBeenCalledWith({ aValue: 1 });
        })

        it('should handle returning true', function() {
            this.component.isAuthorised = function(parameters, callback) { return true; };

            shouldHaveResolved($authoriser.authorise(this.component));
        })

        it('should handle returning false', function() {
            this.component.isAuthorised = function(parameters, callback) { return false; };

            shouldHaveRejected($authoriser.authorise(this.component));
        })

        it('should handle returning promise that resolves to false', function() {
            var deferred = jQuery.Deferred();
            deferred.resolve(false);

            this.component.isAuthorised.returns(deferred.promise());

            shouldHaveRejected($authoriser.authorise(this.component));
        })

        it('should handle returning promise that resolves to true', function() {
            var deferred = jQuery.Deferred();
            deferred.resolve(true);

            this.component.isAuthorised.returns(deferred.promise());

            shouldHaveResolved($authoriser.authorise(this.component));
        })

        it('should handle returning promise that resolves without a value', function() {
            var deferred = jQuery.Deferred();
            deferred.resolve();

            this.component.isAuthorised.returns(deferred.promise());

            shouldHaveResolved($authoriser.authorise(this.component));
        })

        it('should handle returning promise that rejects without a value', function() {
            var deferred = jQuery.Deferred();
            deferred.reject();

            this.component.isAuthorised.returns(deferred.promise());

            shouldHaveRejected($authoriser.authorise(this.component));
        })

        it('should handle returning undefined, but calling the callback function with false', function() {
            this.component.isAuthorised = function(parameters, callback) { callback(false); };

            shouldHaveRejected($authoriser.authorise(this.component));
        })

        it('should handle returning undefined, but calling the callback function with true', function() {
            this.component.isAuthorised = function(parameters, callback) { callback(true); };

            shouldHaveResolved($authoriser.authorise(this.component));
        })
    })

    describe('multiple components to authorise ($authoriser.authoriseAll)', function() {
        beforeEach(function () {
            this.componentA = { isAuthorised: this.stub() };
            this.componentB = { isAuthorised: this.stub() };

            this.components = [this.componentA, this.componentB];
        });

        it('should pass the current routes values as parameters to the isAuthorised method', function() {
            $authoriser.authoriseAll(this.components, { aValue: 1 });

            expect(this.componentA.isAuthorised).toHaveBeenCalledWith({ aValue: 1 });
            expect(this.componentB.isAuthorised).toHaveBeenCalledWith({ aValue: 1 });
        })           

        describe('immediate return', function() {
            it('should reject if at least one fails (1st in list)', function() {
                this.componentA.isAuthorised.returns(true)
                this.componentB.isAuthorised.returns(false)

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })

            it('should reject if at least one fails (2nd in list)', function() {
                this.componentA.isAuthorised.returns(false)
                this.componentB.isAuthorised.returns(true)

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised.returns(true)
                this.componentB.isAuthorised.returns(true)

                shouldHaveResolved($authoriser.authoriseAll(this.components));
            })

            it('should reject if all return false', function() {
                this.componentA.isAuthorised.returns(false)
                this.componentB.isAuthorised.returns(false)

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })
        })

        describe('resolved promise', function() {
            it('should reject if at least one fails (1st in list)', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(true))
                this.componentB.isAuthorised.returns(resolvedPromise(false))

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })

            it('should reject if at least one fails (2nd in list)', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(false))
                this.componentB.isAuthorised.returns(resolvedPromise(true))

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(true))
                this.componentB.isAuthorised.returns(resolvedPromise(true))

                shouldHaveResolved($authoriser.authoriseAll(this.components));
            })

            it('should reject if all return false', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(false))
                this.componentB.isAuthorised.returns(resolvedPromise(false))

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })
        })

        describe('delayed promise', function() {
            beforeEach(function() {
                this.deferredA = jQuery.Deferred();
                this.deferredB = jQuery.Deferred();

                this.componentA.isAuthorised.returns(this.deferredA);
                this.componentB.isAuthorised.returns(this.deferredB);
            })

            it('should reject if at least one fails (1st in list)', function() {
                var authoriseAnyPromise = $authoriser.authoriseAll(this.components);

                this.deferredA.resolve(true);
                this.deferredB.resolve(false);

                shouldHaveRejected(authoriseAnyPromise);
            })

            it('should reject if at least one fails (2nd in list)', function() {
                var authoriseAnyPromise = $authoriser.authoriseAll(this.components);

                this.deferredA.resolve(false);
                this.deferredB.resolve(true);

                shouldHaveRejected(authoriseAnyPromise);
            })        

            it('should resolve if all return true', function() {
                var authoriseAnyPromise = $authoriser.authoriseAll(this.components);

                this.deferredA.resolve(true);
                this.deferredB.resolve(true);

                shouldHaveResolved(authoriseAnyPromise);
            })

            it('should reject if all return false', function() {
                var authoriseAnyPromise = $authoriser.authoriseAll(this.components);

                this.deferredA.resolve(false);
                this.deferredB.resolve(false);

                shouldHaveRejected(authoriseAnyPromise);
            })
        })

        describe('executing callback, no promise, no delay', function() {
            it('should reject if at least one fails (1st in list)', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(true); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(false); };

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })

            it('should reject if at least one fails (2nd in list)', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(false); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(true); };

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(true); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(true); };

                shouldHaveResolved($authoriser.authoriseAll(this.components));
            })

            it('should reject with false if all return false', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(false); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(false); };

                shouldHaveRejected($authoriser.authoriseAll(this.components));
            })
        })
    })

    describe('multiple components to authorise ($authoriser.authoriseAny)', function() {
        beforeEach(function () {
            this.componentA = { isAuthorised: this.stub() };
            this.componentB = { isAuthorised: this.stub() };

            this.components = [this.componentA, this.componentB];
        });

        it('should pass the current routes values as parameters to the isAuthorised method', function() {
            $authoriser.authoriseAny(this.components, { aValue: 1 });

            expect(this.componentA.isAuthorised).toHaveBeenCalledWith({ aValue: 1 });
            expect(this.componentB.isAuthorised).toHaveBeenCalledWith({ aValue: 1 });
        })     

        describe('immediate return', function() {
            it('should resolve if at least one succeeds (1st in list)', function() {
                this.componentA.isAuthorised.returns(true)
                this.componentB.isAuthorised.returns(false)

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should resolve if at least one succeeds (2nd in list)', function() {
                this.componentA.isAuthorised.returns(false)
                this.componentB.isAuthorised.returns(true)

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised.returns(true)
                this.componentB.isAuthorised.returns(true)

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should reject if all return false', function() {
                this.componentA.isAuthorised.returns(false)
                this.componentB.isAuthorised.returns(false)

                shouldHaveRejected($authoriser.authoriseAny(this.components));
            })
        })

        describe('resolved promise', function() {
            it('should resolve if at least one succeeds (1st in list)', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(true))
                this.componentB.isAuthorised.returns(resolvedPromise(false))

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should resolve if at least one succeeds (2nd in list)', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(false))
                this.componentB.isAuthorised.returns(resolvedPromise(true))

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(true))
                this.componentB.isAuthorised.returns(resolvedPromise(true))

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should reject if all return false', function() {
                this.componentA.isAuthorised.returns(resolvedPromise(false))
                this.componentB.isAuthorised.returns(resolvedPromise(false))

                shouldHaveRejected($authoriser.authoriseAny(this.components));
            })
        })

        describe('delayed promise', function() {
            beforeEach(function() {
                this.deferredA = jQuery.Deferred();
                this.deferredB = jQuery.Deferred();

                this.componentA.isAuthorised.returns(this.deferredA);
                this.componentB.isAuthorised.returns(this.deferredB);
            })

            it('should resolve if at least one succeeds (1st in list)', function() {
                var authoriseAnyPromise = $authoriser.authoriseAny(this.components);

                this.deferredA.resolve(true);
                this.deferredB.resolve(false);

                shouldHaveResolved(authoriseAnyPromise);
            })

            it('should resolve if at least one succeeds (2nd in list)', function() {
                var authoriseAnyPromise = $authoriser.authoriseAny(this.components);

                this.deferredA.resolve(false);
                this.deferredB.resolve(true);

                shouldHaveResolved(authoriseAnyPromise);
            })        

            it('should resolve if all return true', function() {
                var authoriseAnyPromise = $authoriser.authoriseAny(this.components);

                this.deferredA.resolve(true);
                this.deferredB.resolve(true);

                shouldHaveResolved(authoriseAnyPromise);
            })

            it('should reject if all return false', function() {
                var authoriseAnyPromise = $authoriser.authoriseAny(this.components);

                this.deferredA.resolve(false);
                this.deferredB.resolve(false);

                shouldHaveRejected(authoriseAnyPromise);
            })
        })

        describe('executing callback, no promise, no delay', function() {
            it('should resolve if at least one succeeds (1st in list)', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(true); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(false); };

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should resolve if at least one succeeds (2nd in list)', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(false); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(true); };

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })        

            it('should resolve if all return true', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(true); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(true); };

                shouldHaveResolved($authoriser.authoriseAny(this.components));
            })

            it('should reject with false if all return false', function() {
                this.componentA.isAuthorised = function(parameters, callback) { callback(false); };
                this.componentB.isAuthorised = function(parameters, callback) { callback(false); };

                shouldHaveRejected($authoriser.authoriseAny(this.components));
            })
        })
    }) 
});