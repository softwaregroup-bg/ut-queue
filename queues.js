const queue = require('pull-pushable');
const DEFAULT = Symbol('default');

module.exports = () => {
    const queues = new Map();

    const create = ({context, callback}) => {
        let id = (context && context.conId && context.conId.toString()) || DEFAULT;
        let created = queue(true, error => {
            queues.delete(id);
            callback && callback(error);
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
        count: () => queues.size
    };
};
