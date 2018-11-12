const queue = require('./queue');
const DEFAULT = Symbol('default');

module.exports = () => {
    const queues = new Map();

    const create = ({
        min,
        max,
        drain,
        drainInterval,
        isEcho,
        context,
        close,
        callback
    }) => {
        close = close || callback;
        let id = (context && context.conId && context.conId.toString()) || DEFAULT;
        let created = queue({
            close: error => {
                queues.delete(id);
                close && close(error);
            },
            min,
            max,
            drain,
            drainInterval,
            isEcho
        });
        queues.set(id, created);
        return created;
    };

    return {
        create,
        get: context => queues.get((context && context.conId && context.conId.toString()) || DEFAULT),
        delete: context => {
            let end = queues.get((context && context.conId && context.conId.toString()) || DEFAULT);
            end && end.end(true);
        },
        end: () => {
            Array.from(queues.values()).forEach(queue => queue.end(true));
        },
        count: () => queues.size
    };
};
