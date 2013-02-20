describe('Messaging - Queries', function () {
    var $query = hx.get('$query');

    describe('Executing a query', function () {
        beforeEach(function () {
            $query.queryUrlTemplate = 'ExecuteQuery/{name}/?values={values}';

            this.promise = $query.query('My Query', {
                id: 3456
            });

            this.successCallback = this.spy();
            this.promise.then(this.successCallback);

            this.failureCallback = this.spy();
            this.promise.fail(this.failureCallback);
        });

        describe('that succeeds', function () {
            it('should resolve the promise with the result, using URL with replaced values', function () {
                this.server.respondWith("GET", 'ExecuteQuery/My Query/?values=' + (encodeURIComponent('{"id":3456}')), [
                200, {
                    "Content-Type": "application/json"
                }, '{ "resultProperty": 5 }']);

                this.server.respond();

                expect(this.successCallback).toHaveBeenCalledWith({
                    resultProperty: 5
                });
            });
        });

        describe('that fails', function () {
            it('should reject the promise', function () {
                this.server.respondWith("GET", 'ExecuteQuery/My Query/?values=' + (encodeURIComponent('{"id":3456}')), [
                500, {
                    "Content-Type": "application/json"
                }, '{}']);

                this.server.respond();

                expect(this.failureCallback).toHaveBeenCalled();
            });
        });
    });
});