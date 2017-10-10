const errors = require('./errors');
const Readable = require('readable-stream/readable');

function createQueue({config, event, registerCounter, end, log}) {
    let queueData = [];
    let forQueue = false;
    let empty = config && config.empty;
    let idleTime = config && config.idle;
    let idleTimer;
    let echoInterval = config && config.echo && config.echo.interval;
    let echoRetriesLimit = config && config.echo && config.echo.retries;
    let echoRetries = 0;
    let echoTimer;
    let stream = new Readable({objectMode: true});
    let counterSize = registerCounter && registerCounter('gauge', 'q', 'Queue size');
    let counterTimeout = registerCounter && registerCounter('counter', 'qt', 'Queue timeouts');
    let counterOverflow = registerCounter && registerCounter('counter', 'qo', 'Queue overflows');

    stream._read = function utQueueRead() {
        if (queueData.length) {
            this.push(queueData.shift());
            counterSize && counterSize(queueData.length);
        } else {
            forQueue = false;
        }
        empty && event && !queueData.length && event('empty');
    };

    function utQueueIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(utQueueIdle, idleTime);
        event('idle');
    }

    function utQueueEcho() {
        if (echoRetriesLimit && ++echoRetries > echoRetriesLimit) {
            log && log.error && log.error(errors.echoTimeout());
            end();
        } else {
            clearTimeout(echoTimer);
            echoTimer = echoInterval && setTimeout(utQueueEcho, echoInterval);
            event('echo');
        }
    }

    function utQueueResetIdle() {
        clearTimeout(idleTimer);
        idleTimer = idleTime && setTimeout(utQueueIdle, idleTime);
    };

    function utQueueResetEcho() {
        echoRetries = 0;
        clearTimeout(echoTimer);
        echoTimer = echoInterval && setTimeout(utQueueEcho, echoInterval);
    };

    // function utQueueAddSource(msg) {
    //     utQueueResetIdle();
    //     if (waiting) {
    //         let cb = waiting;
    //         waiting = false;
    //         cb(null, msg);
    //     } else {
    //         queueData.push(msg);
    //         counterSize && counterSize(queueData.length);
    //     }
    // }

    function utQueuePush(msg) {
        utQueueResetIdle();
        if (forQueue) {
            queueData.push(msg);
            counterSize && counterSize(queueData.length);
        } else {
            forQueue = true;
            stream.push(msg);
        }
    };

    function utQueueReceive(msg) {
        return stream.push(msg);
    }

    function utQueueStream() {
        return stream;
    }

    function utQueueDestroy() {
        stream && stream.push(null);
        stream && stream.unpipe();
        clearTimeout(idleTimer);
        clearTimeout(echoTimer);
        if (counterSize) {
            counterSize.destroy && counterSize.destroy();
            counterSize = undefined;
        }
        if (counterOverflow) {
            counterOverflow.destroy && counterOverflow.destroy();
            counterOverflow = undefined;
        }
        if (counterTimeout) {
            counterTimeout.destroy && counterTimeout.destroy();
            counterTimeout = undefined;
        }
        stream = undefined;
        queueData = [];
    };

    utQueueResetIdle();
    utQueueResetEcho();

    return {
        destroy: utQueueDestroy,
        ping: utQueueResetEcho,
        push: utQueuePush,
        stream: utQueueStream,
        receive: utQueueReceive
    };
};

module.exports = createQueue;
