let create = require('ut-error').define;
let Queue = create('queue');

module.exports = {
    echoTimeout: create('echoTimeout', Queue, 'Timed out waiting for incoming data'),
    invalidRead: create('invalidRead', Queue, 'Unexpected read from queue')
};
