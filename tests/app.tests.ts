/// <reference path="../typings/tsd.d.ts" />

import chai = require('chai');
import App = require('../src/app');

describe('Basic app test', () => {
    it('first test', () => {
        var appInstance = new App('Adam');

        chai.expect(appInstance.greeting()).to.eq('Hello Adam');
    });

    it('second test!', () => {
        var appInstance = new App('Adam');

        chai.expect(appInstance.greeting()).to.eq('Hello Adam');
    });
});