'use strict';

const chai = require('chai');
const expect = chai.expect;

const logic = require('../lib/logic');

describe('Logic integration test', () => {

    it("Returns hellowWorld", () => {
        expect(logic.helloworld('IntegrationTestName')).to.eql('function=helloworld&name=IntegrationTestName');
    });
});
