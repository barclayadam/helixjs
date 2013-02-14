var levelMethodSpecs;

levelMethodSpecs = (function (method) {
    describe("" + method + " - enabled", function () {
        var _ref, _ref1;

        beforeEach(function () {
            hx.log.enabled = true;
        });

        afterEach(function () {
            hx.log.enabled = false;
        });

        // Note the 'hack' to check for existence of apply method. A little
        // internal implementation leaking for sake of IE8/9
        if ((typeof console !== "undefined" && console !== null ? (_ref = console[method]) != null ? _ref.apply : void 0 : void 0) != null) {
            describe('when direct console equivalent is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(console, method);
                    return hx.log[method]('An Argument', 'Another Argument');
                });

                it('should direct calls to the built-in console method', function () {
                    expect(this.logStub).toHaveBeenCalledWith('An Argument', 'Another Argument');
                });
            });
        } else if ((typeof console !== "undefined" && console !== null ? (_ref1 = console.log) != null ? _ref1.apply : void 0 : void 0) != null) {
            describe('when console.log is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(console, 'log');
                    return hx.log[method]('An Argument', 'Another Argument');
                });

                it('should direct calls to the built-in console.log method', function () {
                    expect(this.logStub).toHaveBeenCalledWith('An Argument', 'Another Argument');
                });
            });
        } else {
            describe('when console.log is not available', function () {
                it('should not fail to execute logging methods', function () {
                    return hx.log[method]('An Argument', 'Another Argument');
                });
            });
        }
    });
    describe("" + method + " - disabled", function () {
        var _ref, _ref1;

        beforeEach(function () {
            return hx.log.enabled = false;
        });

        afterEach(function () {
            return hx.log.enabled = false;
        });

        // Note the 'hack' to check for existence of apply method. A little
        // internal implementation leaking for sake of IE8/9
        if ((typeof console !== "undefined" && console !== null ? (_ref = console[method]) != null ? _ref.apply : void 0 : void 0) != null) {
            describe('when direct console equivalent is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(console, method);
                    hx.log[method]('An Argument', 'Another Argument');
                });

                it('should not direct calls to the built-in console method', function () {
                    expect(this.logStub).toHaveNotBeenCalled();
                });
            });
        } else if ((typeof console !== "undefined" && console !== null ? (_ref1 = console.log) != null ? _ref1.apply : void 0 : void 0) != null) {
            describe('when console.log is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(console, 'log');
                    hx.log[method]('An Argument', 'Another Argument');
                });

                it('should not direct calls to the built-in console.log method', function () {
                    expect(this.logStub).toHaveNotBeenCalled();
                });
            });
        }
    });
});

describe('logger', function () {
    levelMethodSpecs('debug');
    levelMethodSpecs('info');
    levelMethodSpecs('warn');
    levelMethodSpecs('error');
});