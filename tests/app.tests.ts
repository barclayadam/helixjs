/// <reference path="../typings/tsd.d.ts" />

import chai = require('chai');
import App = require('../src/app');

var expect = chai.expect;

describe('Basic app test', function () {
    it('first test', function () {
        var appInstance = new App('Adam');

        expect(appInstance.greeting()).to.eq('Hello Adam');
    });
});