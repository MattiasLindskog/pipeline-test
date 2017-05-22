'use strict';

const logic = require('./lib/logic');

exports.handler = (event, context) => {
    console.log('Event:', JSON.stringify(event));
    context.succeed(logic.helloworld(event.name || 'Fallback'));
};