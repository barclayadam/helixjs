function behavesLikeNotification(name) {
    var $notifier = hx.get('$notifier');

    describe("" + name + " with no options", function () {
        beforeEach(function () {
            this.explicitSubscription = this.spy();
            $notifier.subscribe(this.explicitSubscription);

            $notifier[name]('This is the message');
        });

        it('should raise an event with text and level with default empty options', function () {
            expect("notification:" + name).toHaveBeenPublishedWith({
                text: 'This is the message',
                level: name,
                options: {}
            });
        });

        it('should publish the message to any explictly registered callbacks', function () {
            expect(this.explicitSubscription).toHaveBeenCalledWith({
                text: 'This is the message',
                level: name,
                options: {}
            });
        });
    });

    describe("" + name + " with options", function () {
        beforeEach(function () {
            this.explicitSubscription = this.spy();
            $notifier.subscribe(this.explicitSubscription);
            
            $notifier[name]('This is the message', {
                anOption: 'An option value'
            });
        });

        it('should raise an event with text and level with passed options', function () {
            expect("notification:" + name).toHaveBeenPublishedWith({
                text: 'This is the message',
                level: name,
                options: {
                    anOption: 'An option value'
                }
            });
        });

        it('should publish the message to any explictly registered callbacks', function () {
            expect(this.explicitSubscription).toHaveBeenCalledWith({
                text: 'This is the message',
                level: name,
                options: {
                    anOption: 'An option value'
                }
            });
        });
    });
};

describe('notifications', function () {
    behavesLikeNotification('success');
    behavesLikeNotification('warning');
    behavesLikeNotification('error');
});