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
        var command,
            $ajax;

        beforeEach(function () {
            $Command.urlTemplate = 'ExecuteCommand/{name}';

            command = new $Command('My Command', {
                id: ko.observable(3456).addValidationRules({
                    required: true
                })
            });
        });

        describe('that fails validation', function () {
            var validationFailedEventSpy, submittingEventSpy;

            beforeEach(function () {
                $ajax = hx.get('$ajax');
                this.spy($ajax, 'url');

                validationFailedEventSpy = this.spy();
                command.subscribe('validationFailed', validationFailedEventSpy);

                submittingEventSpy = this.spy();
                command.subscribe('submitting', submittingEventSpy);

                command.id(void 0);
            });

            it('should not execute any AJAX', function (done) {
                command.execute().then(function() {
                    expect($ajax.url).toHaveNotBeenCalled();
                }).then(done);
            });

            it('should not raise a submitting event', function (done) {
                command.execute().then(function() {
                    expect(submittingEventSpy).toHaveNotBeenCalled();
                }).then(done);
            });

            it('validate properties', function (done) {
                command.execute().then(function() {
                    expect(command.id.isValid()).toBe(false);
                }).then(done);
            });

            it('should raise a validationFailed event', function (done) {
                command.execute().then(function() {
                    expect(validationFailedEventSpy).toHaveBeenCalledWith( { command: command });
                }).then(done);
            });

            it('should reject returned promise', function (done) {
                command.execute()
                    .then(function() { fail('Should not have resolved'); })
                    .catch(done);
            });
        });

        describe('async validator', function() {
            var resolver, submittingEventSpy;

            beforeEach(function () {
                command = new $Command('My Command', {
                    id: ko.observable(3456).addValidationRules({
                        custom: function() {
                            return new Promise(function(resolve) {
                                resolver = resolve;
                            });
                        }
                    })
                });

                submittingEventSpy = this.spy();
                command.subscribe('submitting', this.submittingEventSpy);
            });

            it('should not raise a submitting event when validation fails', function (done) {
                resolver(false);

                command.execute().then(function() {
                    expect(this.submittingEventSpy).toHaveNotBeenCalled();
                }).then(done);
            });

            it('should raise a submitting event when validation succeeds', function (done) {
                resolver(true);

                command.execute().then(function() {
                    expect(this.submittingEventSpy).toHaveBeenCalled();
                }).then(done);
            });
        })

        describe('that succeeds', function () {
            var succeededEventSpy, submittingEventSpy;

            beforeEach(function () {
                succeededEventSpy = this.spy();
                submittingEventSpy = this.spy();

                command.subscribe('succeeded', succeededEventSpy);
                command.subscribe('submitting', submittingEventSpy);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);

                this.server.respond();
            });

            it('should resolve the promise with the result, using URL with replaced name', function (done) {
                command.execute().then(function(result) {
                    expect(result).toEqual({
                        resultProperty: 5
                    });
                }).then(done);
            });

            it('should raise a submitting event, before succeeded', function (done) {
                command.execute().then(function() {
                    expect(submittingEventSpy).toHaveBeenCalledBefore(succeededEventSpy);
                }).then(done);
            });

            it('should raise a succeeded event', function (done) {
                command.execute().then(function() {
                    expect(succeededEventSpy).toHaveBeenCalled();
                }).then(done);
            });
        });

        describe('overridden URL', function () {
            var succeededEventSpy;

            beforeEach(function () {
                command.setUrl('my/custom/url')

                succeededEventSpy = this.spy();
                command.subscribe('succeeded', succeededEventSpy);

                this.server.respondWith("POST", "my/custom/url", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);

                this.server.respond();
            });

            it('should resolve the promise with the result, using overriden URL', function (done) {
                command.execute().then(function(result) {
                    expect(result).toEqual({
                        resultProperty: 5
                    });
                }).then(done);
            });

            it('should raise a succeeded event', function (done) {
                command.execute().then(function() {
                    expect(succeededEventSpy).toHaveBeenCalled();
                }).then(done);
            });
        });


        describe('that is executed under a different context', function () {
            beforeEach(function () {
                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);
                this.server.respond();
            });

            it('should resolve the promise with the result, using URL with replaced name', function (done) {
                command.execute.call(this).then(function(result) {
                    expect(result).toEqual({
                        resultProperty: 5
                    });
                }).then(done);
            });
        });

        describe('that fails', function () {
            var failedEventSpy, submittingEventSpy;

            beforeEach(function () {
                submittingEventSpy = this.spy();
                failedEventSpy = this.spy();

                command.subscribe('submitting', submittingEventSpy);
                command.subscribe('failed', failedEventSpy);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    500, {
                        "Content-Type": "application/json"
                    }, '{}']);
                this.server.respond();
            });

            it('should reject the promise', function (done) {
                command.execute().then(function() {
                    fail('Should not successfully resolve');
                }).catch(done);
            });

            it('should raise a submitting event, before failed', function (done) {
                command.execute().then(function() {
                    expect(submittingEventSpy).toHaveBeenCalledBefore(failedEventSpy);
                }).catch(done);
            });

            it('should raise a failed event', function (done) {
                command.execute().then(function() {
                    expect(failedEventSpy).toHaveBeenCalled();
                }).catch(done);
            });
        });

        describe('multiple commands with subscriptions', function () {
            var submittingEventSpy1, submittingEventSpy2;

            beforeEach(function () {
                this.command1 = new $Command('My Command 1', {});
                this.command2 = new $Command('My Command 2', {});

                submittingEventSpy1 = this.spy();
                submittingEventSpy2 = this.spy();

                this.command1.subscribe('submitting', submittingEventSpy1);
                this.command2.subscribe('submitting', submittingEventSpy2);
            });

            it('should not raise events to other instances', function (done) {
                this.command1.execute().then(function() {
                    expect(submittingEventSpy1).toHaveBeenCalled();
                    expect(submittingEventSpy2).toHaveNotBeenCalled();
                }).then(done);
            });
        });
    });
});