module.exports = function queue({
    close,
    min = 0,
    max,
    drain,
    drainInterval,
    skipDrain
}) {
    // create a buffer for data
    // that have been pushed
    // but not yet pulled.
    let buffer = [];

    // a pushable is a source stream
    // (abort, cb) => cb(end, data)
    //
    // when pushable is pulled,
    // keep references to abort and cb
    // so we can call back after
    // .end(end) or .push(data)
    let abort, callback;
    let timer;
    let ended;

    function drainTimerReset() {
        if (drain && drainInterval) {
            timer && clearTimeout(timer);
            timer = setTimeout(notifyDrain, drainInterval);
        }
    }

    function notifyDrain() {
        drainTimerReset();
        if (drain && buffer.length <= min) {
            drain(buffer.length);
        }
    }

    function read(_abort, _callback) {
        if (_abort) {
            abort = _abort;
            timer && clearTimeout(timer);
            // if there is already a cb waiting, abort it.
            if (callback) invokeCallback(abort);
        }
        callback = _callback;
        tryCallback();
    }

    function end(end) {
        ended = ended || end || true;
        timer && clearTimeout(timer);
        // attempt to drain
        tryCallback();
    }

    function processValue(error, value) {
        let skipDrain;
        try {
            skipDrain = invokeCallback(error, value);
        } finally {
            if (buffer.length === min && !skipDrain) notifyDrain();
        }
    }

    function push(value) {
        if (ended) return;
        // if sink already waiting,
        // we can call back directly.
        if (callback) {
            processValue(abort, value);
            return;
        }
        // otherwise push data and
        buffer.push(value);
    }

    return {
        push: push,
        end: end,
        source: read,
        length: () => buffer.length,
        start: notifyDrain
    };

    // `tryCallback` calls back to (if any) waiting
    // sink with abort, end, or next data.
    function tryCallback() {
        if (!callback) return;

        if (abort) invokeCallback(abort);
        else if (!buffer.length && ended) invokeCallback(ended);
        else if (buffer.length) processValue(null, buffer.shift());
    }

    // `callback` calls back to waiting sink,
    // and removes references to sink callback.
    function invokeCallback(err, val) {
        let _callback = callback;
        // if error and pushable passed onClose, call it
        // the first time this stream ends or errors.
        if (err && close) {
            let callClose = close;
            close = null;
            callClose(err === true ? null : err);
        }
        callback = null;
        let result = typeof skipDrain === 'function' && skipDrain(val);
        _callback(err, val);
        return result;
    }
};
