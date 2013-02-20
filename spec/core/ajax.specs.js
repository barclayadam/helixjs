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

                this.request.done(this.doneSpy);
                this.request.fail(this.failSpy);

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

            it('should resolve promise with response from server if response is 200', function () {
                expect(this.doneSpy).toHaveBeenCalledWith(this.response);
            });

            it('should include X-Requested-With header with value of XMLHttpRequest', function () {
                expect(this.server.requests[0].requestHeaders['X-Requested-With']).toBe('XMLHttpRequest');
            });

            it('should raise an ajaxRequestSent message', function () {
                expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod
                });
            });

            it('should raise an ajaxResponseReceived message', function () {
                expect("ajaxResponseReceived:success:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod,
                    response: this.response,
                    status: 200,
                    success: true
                });
            });

            it('should not fail promise with response from server if response is 200', function () {
                expect(this.failSpy).toHaveNotBeenCalled();
            });
        });

        describe('success - JSON returned', function () {
            beforeEach(function () {
                this.path = '/Users/Managers';
                this.responseObject = [{
                    id: 132,
                    name: 'Mr John Smith'
                }];

                this.responseObjectAsString = JSON.stringify(this.responseObject);

                this.request = $ajax.url(this.path)[methodName]();

                this.doneSpy = this.spy();

                this.request.done(this.doneSpy);
                this.server.respondWith(httpMethod, this.path, [
                200, {
                    "Content-Type": "application/json"
                },
                this.responseObjectAsString]);

                this.server.respond();
            });
            
            it('should resolve promise with parsed JSON', function () {
                expect(this.doneSpy).toHaveBeenCalledWith(this.responseObject);
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

                        r.promise.done(r.doneSpy)                      
                    });
                });

                this.aggregateDoneSpy = this.spy();
                this.aggregatePromise.done(this.aggregateDoneSpy);

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
                this.requestOutsideOfDetection.done(this.requestOutsideOfDetectionDoneSpy);

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

            it('should resolve aggregate after all detected requests', function () {
                expect(this.aggregateDoneSpy).toHaveBeenCalledAfter(this.requests[0].doneSpy);
                expect(this.aggregateDoneSpy).toHaveBeenCalledAfter(this.requests[1].doneSpy);
            });

            it('should not wait for requests initiated outside of listen callback', function () {
                expect(this.aggregateDoneSpy).toHaveBeenCalledBefore(this.requestOutsideOfDetectionDoneSpy);
            });
            
            it('should resolve aggregate with all responses', function () {
                expect(this.aggregateDoneSpy).toHaveBeenCalledWith(this.requests[0].response, this.requests[1].response);
            });
        });

        describe('failure, with failure handlers added', function () {
            beforeEach(function () {
                this.path = '/Users/List';

                this.request = $ajax.url(this.path)[methodName]();
                this.response = "Failed";

                this.doneSpy = this.spy();
                this.failSpy = this.spy();

                this.request.done(this.doneSpy);
                this.request.fail(this.failSpy);

                this.server.respondWith(httpMethod, this.path, [
                500, {
                    "Content-Type": "text/html"
                },
                this.response]);

                this.server.respond();
            });

            it('should not resolve promise with response from server if response is 500', function () {
                expect(this.doneSpy).toHaveNotBeenCalled();
            });

            it('should raise an ajaxRequestSent message', function () {
                expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod
                });
            });

            it('should raise an ajaxResponseReceived message', function () {
                expect("ajaxResponseReceived:failure:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod,
                    responseText: this.response,
                    status: 500,
                    success: false
                });
            });

            it('should fail promise with response from server if response is not 200', function () {
                expect(this.failSpy).toHaveBeenCalled();
            });

            it('should not publish ajaxResponseFailureUnhandled', function () {
                expect("ajaxResponseFailureUnhandled:" + this.path).toHaveNotBeenPublished();
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

            it('should not resolve promise with response from server if response is 500', function () {
                expect(this.doneSpy).toHaveNotBeenCalled();
            });

            it('should raise an ajaxRequestSent message', function () {
                expect("ajaxRequestSent:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod
                });
            });

            it('should raise an ajaxResponseReceived message', function () {
                expect("ajaxResponseReceived:failure:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod,
                    responseText: this.response,
                    status: 500,
                    success: false
                });
            });

            it('should fail promise with response from server if response is not 200', function () {
                expect(this.failSpy).toHaveBeenCalled();
            });

            it('should not publish ajaxResponseFailureUnhandled', function () {
                expect("ajaxResponseFailureUnhandled:" + this.path).toHaveNotBeenPublished();
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
            
            it('should publish ajaxResponseFailureUnhandled', function () {
                expect("ajaxResponseFailureUnhandled:" + this.path).toHaveBeenPublishedWith({
                    path: this.path,
                    method: httpMethod,
                    responseText: this.response,
                    status: 500,
                    success: false
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
    basicMethodTests('head', 'HEAD');
    
    describe('POST specific', function () {
        var $ajax = hx.get('$ajax');

        it('should POST "values"', function () {
            this.request = $ajax.url('/AUrl').data({
                id: 342
            }).post();
        });
    });
});