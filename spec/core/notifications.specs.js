function behavesLikeNotification(name) {
    var $notifier = hx.get('$notifier');

    describe("" + name + " with no options", function () {
        beforeEach(function () {
            $notifier[name]('This is the message');
        });

        it('should raise an event with text and level with default empty options', function () {
            expect("notification:" + name).toHaveBeenPublishedWith({
                text: 'This is the message',
                level: name,
                options: {}
            });
        });
    });

    describe("" + name + " with options", function () {
        beforeEach(function () {
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
    });
};

describe('notifications', function () {
    behavesLikeNotification('success');
    behavesLikeNotification('warning');
    behavesLikeNotification('error');
});