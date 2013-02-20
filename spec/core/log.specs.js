var levelMethodSpecs = (function (method) {
    var $log = hx.get('$log');

    describe("" + method + " - enabled", function () {
        beforeEach(function () {
            $log.enabled = true;
        });

        afterEach(function () {
            $log.enabled = false;
        });

        if (window.console && window.console[method] != undefined && window.console[method].hasOwnProperty) {
            describe('when direct console equivalent is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(window.console, method);
                    $log[method]('An Argument', 'Another Argument');
                });

                it('should direct calls to the built-in console method', function () {
                    expect(this.logStub).toHaveBeenCalledWith('An Argument', 'Another Argument');
                });
            });
        } else if (window.console && window.console['log'] != undefined && window.console['log'].hasOwnProperty) {
            describe('when console.log is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(window.console, 'log');
                    $log[method]('An Argument', 'Another Argument');
                });

                it('should direct calls to the built-in console.log method', function () {
                    expect(this.logStub).toHaveBeenCalledWith('An Argument', 'Another Argument');
                });
            });
        } else {
            describe('when console.log is not available', function () {
                it('should not fail to execute logging methods', function () {
                    $log[method]('An Argument', 'Another Argument');
                });
            });
        }
    });

    describe("" + method + " - disabled", function () {
        beforeEach(function () {
            $log.enabled = false;
        });

        afterEach(function () {
            $log.enabled = false;
        });

        if (window.console && window.console[method] != undefined && window.console[method].hasOwnProperty) {
            describe('when direct console equivalent is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(window.console, method);
                    $log[method]('An Argument', 'Another Argument');
                });

                it('should not direct calls to the built-in console method', function () {
                    expect(this.logStub).toHaveNotBeenCalled();
                });
            });
        } else if (window.console && window.console['log'] != undefined && window.console['log'].hasOwnProperty) {
            describe('when console.log is available', function () {
                beforeEach(function () {
                    this.logStub = this.stub(window.console, 'log');
                    $log[method]('An Argument', 'Another Argument');
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