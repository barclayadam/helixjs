function browserTagCaseIndependentHtml(html) {
    return jQuery('<div/>').append(html).html();
};

beforeEach(function () {
    var publishSpy = window.sinonSandbox.spy(hx.get('$bus'), "publish");

    this.addMatchers({
        toBeAPromise: function () {
            return (this.actual != null) && (this.actual.done != null) && (this.actual.fail != null);
        },
        
        toBeObservable: function () {
            return ko.isObservable(this.actual);
        },

        toBeAnObservableArray: function () {
            return ko.isObservable(this.actual) && _.isArray(this.actual());
        },

        toBeAFunction: function () {
            return _.isFunction(this.actual);
        },

        toHaveNotBeenCalled: function () {
            return this.actual.called === false;
        },

        toBeAnArray: function () {
            return _.isArray(this.actual);
        },

        toBeAnEmptyArray: function () {
            return this.actual.length === 0;
        },

        toHaveBeenPublished: function () {
            return publishSpy.calledWith(this.actual);
        },

        toHaveBeenPublishedOnce: function () {
            return publishSpy.calledOnceWith(this.actual);
        },

        toHaveBeenPublishedWith: function (args) {
            return publishSpy.calledWith(this.actual, args);
        },

        toHaveNotBeenPublished: function () {
            return !(publishSpy.calledWith(this.actual));
        },

        toHaveNotBeenPublishedWith: function (args) {
            return publishSpy.neverCalledWith(this.actual, args);
        },

        toBeDisabled: function() {
            return this.actual.disabled === true || this.actual.getAttribute('disabled') == 'disabled';
        },

        toBeHidden: function() {
            return this.actual.style.display == 'none';
        }
    });
});