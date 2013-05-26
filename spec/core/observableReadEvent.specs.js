function basicTests(obs, initialValue) {

    beforeEach(function() {
        this.readInterceptor = this.stub();
        obs.subscribe(this.readInterceptor, undefined, 'read')
    })

    it('should not call interceptor function immediately', function() {
        expect(this.readInterceptor).toHaveNotBeenCalled();
    })

    it('should call the interceptor passing the target observable as parameter', function() {
        obs();
        expect(this.readInterceptor).toHaveBeenCalledWith(obs);
    })
}

describe('readInterceptor observable extender', function() {
    describe('ko.observable', function() {
        basicTests(ko.observable('My initial value'), 'My initial value')
    })

    describe('ko.observableArray', function() {        
        basicTests(ko.observableArray(['My initial value']), ['My initial value'])
    })
})