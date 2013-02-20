describe('Bus', function () {
    describe('Given a new EventBus', function () {
        beforeEach(function () {
            this.bus = hx.get('$EventBus');
        });

        it('Allows subscribing to named event', function () {
            var spy = this.spy();

            this.bus.subscribe("myEvent", spy);
            
            this.bus.publish("myEvent");
            
            expect(spy).toHaveBeenCalledOnce();
        });

        it('Allows subscribing to multiple named events', function () {
            var spy = this.spy();

            this.bus.subscribe(["myEvent", "myOtherEvent"], spy);
            this.bus.publish("myEvent");

            expect(spy).toHaveBeenCalledOnce();
            this.bus.publish("myOtherEvent");

            expect(spy).toHaveBeenCalledTwice();
        });

        it('Allows unsubscribing from named event using returned token', function () {
            var spy = this.spy(), subscription;

            subscription = this.bus.subscribe("myEvent", spy);
            subscription.unsubscribe();

            this.bus.publish("myEvent");

            expect(spy.called).toBe(false);
        });

        it('Allows unsubscribing from named event using returned token with multiple subscribers to same event', function () {
            var spy1 = this.spy(), 
                spy2  = this.spy(), 
                subscription;

            this.bus.subscribe("myEvent", spy1);

            subscription = this.bus.subscribe("myEvent", spy2);
            subscription.unsubscribe();

            this.bus.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2.called).toBe(false);
        });

        it('Allows multiple subscribers to a named event', function () {
            var spy1 = this.spy(), 
                spy2 = this.spy();

            this.bus.subscribe("myEvent", spy1);
            this.bus.subscribe("myEvent", spy2);

            this.bus.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2).toHaveBeenCalledOnce();
        });

        it('Allows subscriptions to namespaced events', function () {
            var spy1 = this.spy();

            this.bus.subscribe("myEvent:subNamespace", spy1);

            this.bus.publish("myEvent:subNamespace");

            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any root subscribers', function () {
            var spy1 = this.spy();

            this.bus.subscribe("myEvent", spy1);
            this.bus.publish("myEvent:subNamespace");

            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any root subscribers with nested namespaces', function () {
            var spy1 = this.spy();            
            this.bus.subscribe("myEvent", spy1);

            this.bus.publish("myEvent:subNamespace:anotherSubNamespace");
            
            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Should publish a namespaced message to any parent subscribers with nested namespaces', function () {
            var spy1= this.spy();
            this.bus.subscribe("myEvent:subNamespace", spy1);

            this.bus.publish("myEvent:subNamespace:anotherSubNamespace");
            
            expect(spy1).toHaveBeenCalledOnce();
        });

        it('Publishes only to subscribers with same event name', function () {
            var spy1  = this.spy(), 
                spy2  = this.spy();

            this.bus.subscribe("myEvent", spy1);
            this.bus.subscribe("myOtherEvent", spy2);

            this.bus.publish("myEvent");

            expect(spy1).toHaveBeenCalledOnce();
            expect(spy2.called).toBe(false);
        });

        it('Calls subscribers with single argument passed to publish', function () {
            var spy = this.spy();

            this.bus.subscribe("myEvent", spy);

            this.bus.publish("myEvent", "My Data");

            expect(spy).toHaveBeenCalledWith("My Data");
        });

        it('Calls subscribers with single complex argument passed to publish', function () {
            var spy = this.spy();

            this.bus.subscribe("myEvent", spy);

            this.bus.publish("myEvent", {
                key: "My Data"
            });

            expect(spy).toHaveBeenCalledWith({
                key: "My Data"
            });
        });
    });
});