'use strict';

const chai = require('chai');
const expect = chai.expect;

const logic = require('../lib/logic');

describe('Logic unit test', () => {

    it("Returns hellowWorld", () => {
        expect(logic.helloworld('UnitTestName')).to.eql('function=helloworld&name=UnitTestName');
    });
});
