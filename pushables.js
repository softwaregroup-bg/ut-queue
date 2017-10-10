const queue = require('pull-pushable');
const DEFAULT = Symbol('default');

module.exports = () => {
    const queues = new Map();

    const create = params => {
        let id = (params.context && params.context.conId && params.context.conId.toString()) || DEFAULT;
        let created = queue(() => {
            queues.delete(id);
            console.error('deleted ' + id.toString());//remove
        });
        queues.set(id, created);
        return created;
    };

    return {
        create,
        get: context => queues.get((context && context.conId && context.conId.toString()) || DEFAULT),
        delete: context => {
            let id = (context && context.conId) || DEFAULT;
            let end = queues.get(id);
            if (end) {
                queues.delete(id);
                end(true);
            }
        },
        count: () => queues.size
    };
};
