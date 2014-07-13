var test = require('tape');
var app = require('../src/app');

test('basic arithmetic', function (t) {
    t.plan(2);

    t.equal(2 + 3, 5);
    t.equal(7 * 8 + 9, 65);
});