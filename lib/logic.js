'use strict';
const qs = require('querystring');

module.exports = {
    helloworld: name => {
        console.log('Hello', name);
        const result = qs.encode({function: 'helloworld', name: name});
        console.log('Produced', result);
        return result;
    }
};