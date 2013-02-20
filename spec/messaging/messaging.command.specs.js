describe('Messaging - Commands', function () {
    var $command = hx.get('$command');
    
    describe('Executing a command (low-level)', function () {
        beforeEach(function () {
            $command.commandUrlTemplate = 'ExecuteCommand/{name}';
            this.promise = $command.command('My Command', {
                id: 3456
            });

            this.successCallback = this.spy();
            this.promise.then(this.successCallback);

            this.failureCallback = this.spy();
            this.promise.fail(this.failureCallback);
        });

        describe('that succeeds', function () {
            it('should resolve the promise with the result, using URL with replaced name', function () {
                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);

                this.server.respond();

                expect(this.successCallback).toHaveBeenCalledWith({
                    resultProperty: 5
                });
            });
        });

        describe('that fails', function () {
            it('should reject the promise', function () {
                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    500, {
                        "Content-Type": "application/json"
                    }, '{}']);

                this.server.respond();

                expect(this.failureCallback).toHaveBeenCalled();
            });
        });
    });
    describe('Manipulating a Command', function () {
        beforeEach(function () {
            this.command = new $command.Command('My Command', {
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

    describe('Executing a Command', function () {
        beforeEach(function () {
            $command.commandUrlTemplate = 'ExecuteCommand/{name}';

            this.command = new $command.Command('My Command', {
                id: ko.observable(3456).addValidationRules({
                    required: true
                })
            });

            this.successCallback = this.spy();
            this.failureCallback = this.spy();
        });

        describe('that fails validation', function () {
            beforeEach(function () {
                this.command.id(void 0);

                this.promise = this.command.execute();
                this.promise.then(this.successCallback);
                this.promise.fail(this.failureCallback);

                this.server.respondWith("POST", "ExecuteCommand/My Command", [
                    200, {
                        "Content-Type": "application/json"
                    }, '{ "resultProperty": 5}']);
                this.server.respond();
            });

            it('should not execute any AJAX', function () {
                expect(this.successCallback).toHaveNotBeenCalled();
                expect(this.failureCallback).toHaveNotBeenCalled();
            });

            it('validate properties', function () {
                expect(this.command.id.isValid()).toBe(false);
            });
        });

        describe('that succeeds', function () {
            beforeEach(function () {
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
        });

        describe('that fails', function () {
            beforeEach(function () {
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
        });
    });
});