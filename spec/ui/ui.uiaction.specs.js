describe('UIAction', function () {
    var uiAction = hx.get('$UiAction');

    describe('basic action with no configuration', function () {
        beforeEach(function () {
            var _this = this;
            
            this.actionSpy = this.spy(function () {
                _this.executingDuringProcessing = _this.action.executing();
                return "My Return Value";
            });

            this.action = uiAction(this.actionSpy);
            this.returnValue = this.action('A Value');
        });

        it('should be a function', function () {
            expect(this.action).toBeAFunction();
        });

        it('should pass through calls to the configured function', function () {
            expect(this.actionSpy).toHaveBeenCalled();
        });

        it('should pass through arguments to the configured function', function () {
            expect(this.actionSpy).toHaveBeenCalledWith('A Value');
        });

        it('should return value of action', function () {
            expect(this.returnValue).toEqual("My Return Value");
        });

        it('should have an always-true enabled observable attached', function () {
            expect(this.action.enabled).toBeObservable();
            expect(this.action.enabled()).toBe(true);
        });

        it('should have executing observable that is true only when executing', function () {
            expect(this.executingDuringProcessing).toBe(true);
            expect(this.action.executing()).toBe(false);
        });
    });

    describe('basic action with no configuration and no return value', function () {
        beforeEach(function () {
            this.action = uiAction(this.spy());
            this.returnValue = this.action('A Value');
        });

        it('should return undefined on execution', function () {
            expect(this.returnValue).toBeUndefined();
        });
    })

    describe('basic action with context provide', function () {
        beforeEach(function () {
            this.context = { aProperty: 'A value' };
            this.contextsRecorded = contextsRecorded = {};

            this.actionOptions = {
                enabled: function() {
                    contextsRecorded['enabled'] = this;

                    return true
                },

                action: function() {
                    contextsRecorded['action'] = this;
                },

                context: this.context
            };

            this.action = uiAction(this.actionOptions);
            this.action();
        });

        it('should call enabled function with context set', function () {
            expect(this.contextsRecorded['enabled']).toBe(this.context);
        });

        it('should call action function with context set', function () {
            expect(this.contextsRecorded['action']).toBe(this.context);
        });
    })


    describe('basic action with enabled observable passed', function () {
        beforeEach(function () {
            var _this = this;

            this.actionSpy = this.spy(function () {
                _this.executingDuringProcessing = _this.action.executing();
                return true
            });

            this.enabled = ko.observable(true);

            this.action = uiAction({
                enabled: this.enabled,
                action: this.actionSpy
            });
        });

        describe('when enabled is true', function () {
            beforeEach(function () {
                this.enabled(true);
                this.action('A Value');
            });

            it('should pass through calls to the configured function', function () {
                expect(this.actionSpy).toHaveBeenCalled();
            });

            it('should pass through arguments to the configured function', function () {
                expect(this.actionSpy).toHaveBeenCalledWith('A Value');
            });

            it('should have a true enabled observable attached', function () {
                expect(this.action.enabled()).toBe(true);
            });

            it('should have executing observable that is true only when executing', function () {
                expect(this.executingDuringProcessing).toBe(true);
                expect(this.action.executing()).toBe(false);
            });
        });

        describe('when enabled is false', function () {
            beforeEach(function () {
                this.enabled(false);
                this.action('A Value');
            });

            it('should not pass through calls to the configured function', function () {
                expect(this.actionSpy).toHaveNotBeenCalled();
            });

            it('should have a false enabled observable attached', function () {
                expect(this.action.enabled()).toBe(false);
            });
        });
    });

    describe('async action that returns promise', function () {
        beforeEach(function () {
            var _this = this;
            this.deferred = jQuery.Deferred();

            this.actionSpy = this.spy(function () {
                _this.executingDuringProcessing = _this.action.executing();
                return _this.deferred;
            });

            this.action = uiAction(this.actionSpy);
            this.action();
        });

        it('should have executing observable that is true whilst deferred has not resolved', function () {
            expect(this.executingDuringProcessing).toBe(true);
            expect(this.action.executing()).toBe(true);
        });

        it('should have executing observable that is false when deferred resolves', function () {
            this.deferred.resolve();
            expect(this.action.executing()).toBe(false);
        });
    });

    describe('async action that returns promise, marked as disableDuringExecution', function () {
        beforeEach(function () {
            var _this = this;
            this.deferred = jQuery.Deferred();
            this.actionSpy = this.spy(function () {
                return _this.deferred;
            });

            this.action = uiAction({
                disableDuringExecution: true,
                action: this.actionSpy
            });

            this.action();
            this.action();
            this.action();
        });

        it('should only execute function once whilst the first has not completed', function () {
            expect(this.actionSpy).toHaveBeenCalledOnce();
        });

        it('should allow execution again after first call completes', function () {
            this.deferred.resolve();
            this.action();
            expect(this.actionSpy).toHaveBeenCalledTwice();
        });
    });
});