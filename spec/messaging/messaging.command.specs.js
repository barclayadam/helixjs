describe('Messaging - Commands', function () {
    var $Command = hx.get('$Command');
    
    describe('Manipulating a Command', function () {
        beforeEach(function () {
            this.command = new $Command('My Command', {
                id: 3456,
                name: 'My Name'
            });

            this.command.extraProperty = 4;
        });

        it('should only include values from defaultValues in JSON', function () {
            expect(JSON.parse(JSON.stringify(this.command))).toEqual({
                id: 3456,
                name: 'My Name'
            });
        });

        it('should be validatable', function () {
            expect(this.command.validate).toBeAFunction();
        });

        it('should have directly accessible observables for values defined in constructor', function () {
            expect(this.command.id()).toEqual(3456);
            expect(this.command.name()).toEqual('My Name');
        });
    });

    it('should allow creating a Command without new keyword', function () {
        var command = $Command('My Command', {
                id: 3456,
                name: 'My Name'
            });

        expect(command).not.toBeNull();
    });

    describe('Executing a Command', function () {
        beforeEach(function () {
            $Command.urlTemplate = 'ExecuteCommand/{name}';

            this.command = new $Command('My Command', {
                id: ko.observable(3456).addValidationRules({
                    required: true
                })
            });

            this.successCallback = this.spy();
            this.failureCallback = this.spy();
        });

        describe('that fails validation', function () {
            beforeEach(function () {
                this.validationFailedEventSpy = this.spy();
                this.command.subscribe('validationFailed', this.validationFailedEventSpy);

                this.submittingEventSpy = this.spy();
                this.command.subscribe('submitting', this.submittingEventSpy);

                this.command.id(void 0);

                this.promise = this.command.execute();
                this.promise.then(this.successCallback);
                this.promise.fail(this.failureCallback);
            });

            it('should not execute any AJAX', function () {
                expect(this.successCallback).toHaveNotBeenCalled();
                expect(this.failureCallback).toHaveNotBeenCalled();
            });

            it('should not raise a submitting event', function () {
                expect(this.submittingEventSpy).toHaveNotBeenCalled();
            });

            it('validate properties', function () {
                expect(this.command.id.isValid()).toBe(false);
            });

            it('should raise a validationFailed event', function () {
                expect(this.validationFailedEventSpy).toHaveBeenCalledWith( { command: this.command });
            });
        });

        describe('async validator', function() {
            beforeEach(function () {
                this.asyncValidationDeferred = asyncValidationDeferred = new $.Deferred();

                this.command = new $Command('My Command', {
                    id: ko.observable(3456).addValidationRules({
                        custom: function() {
                            return asyncValidationDeferred;
                        }
                    })
                });

                this.submittingEventSpy = this.spy();
                this.command.subscribe('submitting', this.submittingEventSpy);

                this.command.execute();
            });

            it('should not raise a submitting event when validation fails', function () {
                this.asyncValidationDeferred.resolve(false);
                expect(this.submittingEventSpy).toHaveNotBeenCalled();
            });

            it('should not raise a submitting event when validation succeeds', function () {
                this.asyncValidationDeferred.resolve(true);
                expect(this.submittingEventSpy).toHaveBeenCalled();
            });
        })

        describe('that succeeds', function () {
            beforeEach(function () {
                this.succeededEventSpy = this.spy();
                this.command.subscribe('succeeded', this.succeededEventSpy);

                this.submittingEventSpy = this.spy();
                this.command.subscribe('submitting', this.submittingEventSpy);

                this.promise = this.command.execute();
                this.promise.then(this.successCallback);
                this.promise.fail(this.failureCallback);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);
                this.server.respond();
            });

            it('should resolve the promise with the result, using URL with replaced name', function () {
                expect(this.successCallback).toHaveBeenCalledWith({
                    resultProperty: 5
                });
            });

            it('should raise a submitting event, before succeeded', function () {
                expect(this.submittingEventSpy).toHaveBeenCalledBefore(this.succeededEventSpy);
            });

            it('should raise a succeeded event', function () {
                expect(this.succeededEventSpy).toHaveBeenCalled();
            });
        });

        describe('overridden URL', function () {
            beforeEach(function () {
                this.command.setUrl('my/custom/url')

                this.succeededEventSpy = this.spy();
                this.command.subscribe('succeeded', this.succeededEventSpy);

                this.promise = this.command.execute();
                this.promise.then(this.successCallback);

                this.server.respondWith("POST", "my/custom/url", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);

                this.server.respond();
            });

            it('should resolve the promise with the result, using overriden URL', function () {
                expect(this.successCallback).toHaveBeenCalledWith({
                    resultProperty: 5
                });
            });

            it('should raise a succeeded event', function () {
                expect(this.succeededEventSpy).toHaveBeenCalled();
            });
        });


        describe('that is executed under a different context', function () {
            beforeEach(function () {
                this.promise = this.command.execute.call(this);
                this.promise.then(this.successCallback);
                this.promise.fail(this.failureCallback);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);
                this.server.respond();
            });

            it('should resolve the promise with the result, using URL with replaced name', function () {
                expect(this.successCallback).toHaveBeenCalledWith({
                    resultProperty: 5
                });
            });
        });

        describe('that fails', function () {
            beforeEach(function () {
                this.failedEventSpy = this.spy();
                this.command.subscribe('failed', this.failedEventSpy);

                this.submittingEventSpy = this.spy();
                this.command.subscribe('submitting', this.submittingEventSpy);

                this.promise = this.command.execute();
                
                this.promise.then(this.successCallback);
                this.promise.fail(this.failureCallback);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    500, {
                        "Content-Type": "application/json"
                    }, '{}']);
                this.server.respond();
            });

            it('should reject the promise', function () {
                expect(this.failureCallback).toHaveBeenCalled();
            });

            it('should raise a submitting event, before failed', function () {
                expect(this.submittingEventSpy).toHaveBeenCalledBefore(this.failedEventSpy);
            });

            it('should raise a failed event', function () {
                expect(this.failedEventSpy).toHaveBeenCalled();
            });
        });

        describe('multiple commands with subscriptions', function () {
            beforeEach(function () {

                this.command1 = new $Command('My Command 1', {});
                this.command2 = new $Command('My Command 2', {});

                this.submittingEventSpy1 = this.spy();
                this.submittingEventSpy2 = this.spy();

                this.command1.subscribe('submitting', this.submittingEventSpy1);
                this.command2.subscribe('submitting', this.submittingEventSpy2);

                this.promise = this.command1.execute();
            });

            it('should not raise events to other instances', function () {
                expect(this.submittingEventSpy1).toHaveBeenCalled();
                expect(this.submittingEventSpy2).toHaveNotBeenCalled();
            });
        });
    });
});