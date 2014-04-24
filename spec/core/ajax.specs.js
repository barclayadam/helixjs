function basicMethodTests(methodName, httpMethod) {
    var $ajax = hx.get('$ajax');
    
    return describe(methodName, function () {
        describe('success', function () {
            beforeEach(function () {
                this.path = '/Templates/Users List';

                this.response = "My HTML Response";
                this.request = $ajax.url(this.path)[methodName]();

                this.doneSpy = this.spy();
                this.failSpy = this.spy();

                this.request.then(this.doneSpy);
                this.request.catch(this.failSpy);

                this.server.respondWith(httpMethod, this.path, [
                200, {
                    "Content-Type": "text/html"
                },
                this.response]);

                this.server.respond();
            });

            it('should return a promise to attach events to', function () {
                expect(this.request).toBeAPromise();
            });

            it('should resolve promise with response from server if response is 200', function (done) {
                this.request.then(function(response) {
                    expect(response).toEqual('My HTML Response');
                }).then(done);
            });

            it('should include X-Requested-With header with value of XMLHttpRequest', function () {
                expect(this.server.requests[0].requestHeaders['X-Requested-With']).toBe('XMLHttpRequest');
            });

            it('should raise an ajaxRequestSent message', function (done) {
                this.request.then(function() {
                    expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod
                    });
                });
            });

            it('should raise an ajaxResponseReceived message', function (done) {
                this.request.then(function(response) {
                    expect("ajaxResponseReceived:success:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod,
                        response: this.response,
                        status: 200,
                        success: true,
                        headers: { 'Content-Type': 'text/html' }
                    });
                }).then(done);
            });

            it('should not fail promise with response from server if response is 200', function (done) {
                this.request.then(function(response) {
                    expect(this.failSpy).toHaveNotBeenCalled();
                }).then(done);
            });
        });

        describe('success - JSON returned', function () {
            var responseObject = [{
                    id: 132,
                    name: 'Mr John Smith'
                }];

            beforeEach(function () {
                this.path = '/Users/Managers';

                this.responseObjectAsString = JSON.stringify(responseObject);

                this.request = $ajax.url(this.path)[methodName]();

                this.doneSpy = this.spy();

                this.request.then(this.doneSpy);
                this.server.respondWith(httpMethod, this.path, [
                200, {
                    "Content-Type": "application/json"
                },
                this.responseObjectAsString]);

                this.server.respond();
            });
            
            it('should resolve promise with parsed JSON', function (done) {
                this.request.then(function(response) {
                    expect(this.doneSpy).toHaveBeenCalledWith(responseObject);
                }).then(done);
            });
        });

        describe('listening for all requests - all successful', function () {
            beforeEach(function () {
                var _this = this;

                this.requests = [{
                        path: '/Users/Managers',
                        response: [{
                            id: 132,
                            name: 'Mr John Smith'
                        }]
                    }, {
                        path: '/Users/Actions',
                        response: ['Delete', ' Suspend']
                    }];

                this.aggregatePromise = $ajax.listen(function () {
                    _.each(_this.requests, function(r) {
                        r.promise = $ajax.url(r.path)[methodName]();
                        r.doneSpy = _this.spy();  

                        r.promise.then(r.doneSpy)                      
                    });
                });

                this.aggregateDoneSpy = this.spy();
                this.aggregatePromise.then(this.aggregateDoneSpy);

                _.each(this.requests, function(r) {
                    _this.server.respondWith(httpMethod, r.path, [
                        200, {
                            "Content-Type": "application/json"
                        },
                        JSON.stringify(r.response)]);
                });

                this.server.respond();

                this.requestOutsideOfDetection = $ajax.url('/OutsideDetectionPath')[methodName]();
                this.requestOutsideOfDetectionDoneSpy = this.spy();
                this.requestOutsideOfDetection.then(this.requestOutsideOfDetectionDoneSpy);

                this.server.respondWith(httpMethod, '/OutsideDetectionPath', [
                    200, {
                        "Content-Type": "application/json"
                    },
                    JSON.stringify({ aProperty: 'A Value'})]);

                this.server.respond();
            });

            it('should return a promise to attach listeners to', function () {
                expect(this.aggregatePromise).toBeAPromise();
            });

            it('should resolve aggregate after all detected requests', function (done) {
                this.aggregatePromise.then(function() {
                    expect(this.aggregateDoneSpy).toHaveBeenCalledAfter(this.requests[0].doneSpy);
                    expect(this.aggregateDoneSpy).toHaveBeenCalledAfter(this.requests[1].doneSpy);
                }).then(done);
            });

            it('should not wait for requests initiated outside of listen callback', function (done) {
                this.aggregatePromise.then(function() {
                    expect(this.aggregateDoneSpy).toHaveBeenCalledBefore(this.requestOutsideOfDetectionDoneSpy);
                }).then(done);
            });
            
            it('should resolve aggregate with all responses', function (done) {
                this.aggregatePromise.then(function() {
                    expect(this.aggregateDoneSpy).toHaveBeenCalledWith(this.requests[0].response, this.requests[1].response);
                }).then(done);
            });
        });

        describe('failure, with failure handlers added', function () {
            beforeEach(function () {
                this.path = '/Users/List';

                this.request = $ajax.url(this.path)[methodName]();
                this.response = "Failed";

                this.doneSpy = this.spy();
                this.failSpy = this.spy();

                this.request.then(this.doneSpy);
                this.request.catch(this.failSpy);

                this.server.respondWith(httpMethod, this.path, [
                500, {
                    "Content-Type": "text/html"
                },
                this.response]);

                this.server.respond();
            });

            it('should not resolve promise with response from server if response is 500', function (done) {
                this.request.catch(function(response) {
                    expect(this.doneSpy).toHaveNotBeenCalled();
                }).then(done);
            });

            it('should raise an ajaxRequestSent message', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod
                    });
                }).then(done);
            });

            it('should raise an ajaxResponseReceived message', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxResponseReceived:failure:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod,
                        responseText: this.response,
                        status: 500,
                        success: false,
                        headers: { 'Content-Type': 'text/html' }
                    });
                }).then(done);
            });

            it('should fail promise with response from server if response is not 200', function (done) {
                this.request.catch(function(response) {
                    expect(this.failSpy).toHaveBeenCalled();
                }).then(done);
            });

            it('should not publish ajaxResponseFailureUnhandled', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxResponseFailureUnhandled:" + this.path).toHaveNotBeenPublished();
                }).then(done);
            });
        });

        describe('failure, with failure handlers added as second argument to then', function () {
            beforeEach(function () {
                this.path = '/Users/List';
                this.request = $ajax.url(this.path)[methodName]();
                this.response = "Failed";

                this.doneSpy = this.spy();
                this.failSpy = this.spy();

                this.request.then(this.doneSpy, this.failSpy);

                this.server.respondWith(httpMethod, this.path, [
                500, {
                    "Content-Type": "text/html"
                },
                this.response]);

                this.server.respond();
            });

            it('should not resolve promise with response from server if response is 500', function (done) {
                this.request.catch(function(response) {
                    expect(this.doneSpy).toHaveNotBeenCalled();
                }).then(done);
            });

            it('should raise an ajaxRequestSent message', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod
                    });
                }).then(done);
            });

            it('should raise an ajaxResponseReceived message', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxResponseReceived:failure:" + this.path).toHaveBeenPublishedWith({
                        path: this.path,
                        method: httpMethod,
                        responseText: this.response,
                        status: 500,
                        success: false,
                        headers: { 'Content-Type': 'text/html' }
                    });
                }).then(done);
            });

            it('should fail promise with response from server if response is not 200', function (done) {
                this.request.catch(function(response) {
                    expect(this.failSpy).toHaveBeenCalled();
                }).then(done);
            });

            it('should not publish ajaxResponseFailureUnhandled', function (done) {
                this.request.catch(function(response) {
                    expect("ajaxResponseFailureUnhandled:" + this.path).toHaveNotBeenPublished();
                }).then(done);
            });
        });

        describe('failure with no fail handlers added', function () {
            beforeEach(function () {
                this.path = '/Users/List';
                this.request = $ajax.url(this.path)[methodName]();
                this.response = "Failed";

                this.server.respondWith(httpMethod, this.path, [
                500, {
                    "Content-Type": "text/html"
                },
                this.response]);

                this.server.respond();
            });
            
            it('should publish ajaxResponseFailureUnhandled', function (done) {
                expect("ajaxResponseFailureUnhandled:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod,
                    responseText: this.response,
                    status: 500,
                    success: false,
                    headers: { 'Content-Type': 'text/html' }
                });
            });
        });
    });
};

describe('ajax', function () {
    basicMethodTests('get', 'GET');
    basicMethodTests('post', 'POST');
    basicMethodTests('put', 'PUT');
    basicMethodTests('delete', 'DELETE');
    
    describe('POST specific', function () {
        var $ajax = hx.get('$ajax');

        it('should POST "values"', function () {
            this.request = $ajax.url('/AUrl').data({
                id: 342
            }).post();
        });
    });
});