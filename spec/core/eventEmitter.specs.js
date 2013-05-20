describe('EventEmitter', function () {
    describe('Given a new EventEmitter', function () {
        beforeEach(function () {
            this.eventEmitter = hx.get('$EventEmitterFactory')();
        });

        it('Allows subscribing to named event', function () {
            var spy = this.spy();

            this.eventEmitter.subscribe("myEvent", spy);
            
            this.eventEmitter.publish("myEvent");
            
            expect(spy).toHaveBeenCalledOnce();
        });

        it('Allows subscribing to multiple named events', function () {
            var spy = this.spy();

            this.eventEmitter.subscribe(["myEvent", "myOtherEvent"], spy);
            this.eventEmitter.publish("myEvent");

            expect(spy).toHaveBeenCalledOnce();
            this.eventEmitter.publish("myOtherEvent");

            expect(spy).toHaveBeenCalledTwice();
        });

        it('Allows unsubscribing from named event using returned token', function () {
            var spy = this.spy(), subscription;

            subscription = this.eventEmitter.subscribe("myEvent", spy);
            subscription.unsubscribe();

            this.eventEmitter.publish("myEvent");

            expect(spy.called).toBe(false);
        });

        it('Allows unsubscribing from named event using returned token with multiple subscribers to same event', function () {
            var spy1 = this.spy(), 
                spy2  = this.spy(), 
                subscription;

            this.eventEmitter.subscribe("myEvent", spy1);

            subscription = this.eventEmitter.subscribe("myEvent", spy2);
            subscription.unsubscribe();

            this.eventEmitter.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2.called).toBe(false);
        });

        it('Allows multiple subscribers to a named event', function () {
            var spy1 = this.spy(), 
                spy2 = this.spy();

            this.eventEmitter.subscribe("myEvent", spy1);
            this.eventEmitter.subscribe("myEvent", spy2);

            this.eventEmitter.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2).toHaveBeenCalledOnce();
        });

        it('Allows subscriptions to namespaced events', function () {
            var spy1 = this.spy();

            this.eventEmitter.subscribe("myEvent:subNamespace", spy1);

            this.eventEmitter.publish("myEvent:subNamespace");

            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any root subscribers', function () {
            var spy1 = this.spy();

            this.eventEmitter.subscribe("myEvent", spy1);
            this.eventEmitter.publish("myEvent:subNamespace");

            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any root subscribers with nested namespaces', function () {
            var spy1 = this.spy();            
            this.eventEmitter.subscribe("myEvent", spy1);

            this.eventEmitter.publish("myEvent:subNamespace:anotherSubNamespace");
            
            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any parent subscribers with nested namespaces', function () {
            var spy1= this.spy();
            this.eventEmitter.subscribe("myEvent:subNamespace", spy1);

            this.eventEmitter.publish("myEvent:subNamespace:anotherSubNamespace");
            
            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Publishes only to subscribers with same event name', function () {
            var spy1  = this.spy(), 
                spy2  = this.spy();

            this.eventEmitter.subscribe("myEvent", spy1);
            this.eventEmitter.subscribe("myOtherEvent", spy2);

            this.eventEmitter.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2.called).toBe(false);
        });

        it('Calls subscribers with single argument passed to publish', function () {
            var spy = this.spy();

            this.eventEmitter.subscribe("myEvent", spy);

            this.eventEmitter.publish("myEvent", "My Data");

            expect(spy).toHaveBeenCalledWith("My Data");
        });

        it('Calls subscribers with single complex argument passed to publish', function () {
            var spy = this.spy();

            this.eventEmitter.subscribe("myEvent", spy);

            this.eventEmitter.publish("myEvent", {
                key: "My Data"
            });

            expect(spy).toHaveBeenCalledWith({
                key: "My Data"
            });
        });

        describe('local eventing', function() {
            beforeEach(function() {
                var EventEmitterFactory = hx.get('$EventEmitterFactory');

                function OtherModel() {
                    EventEmitterFactory.mixin(this);

                    this.raiseEvent = function() {
                        this.$publish('anEvent', this);
                    }
                }

                this.objectToHaveEventing = new OtherModel();

                this.anEventSubscriber = this.spy();
                this.objectToHaveEventing.subscribe('anEvent', this.anEventSubscriber);
            })

            it('should mix in subscribe function directly to object', function() {
                expect(this.objectToHaveEventing.subscribe).toBeAFunction();
            })

            it('should publish events raised on eventEmitter to local subscriptions', function() {
                this.objectToHaveEventing.raiseEvent();

                expect(this.anEventSubscriber).toHaveBeenCalledOnce();
                expect(this.anEventSubscriber).toHaveBeenCalledWith(this.objectToHaveEventing);
            })

        })
    });
});