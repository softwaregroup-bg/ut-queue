const queue = require('./queue');
const DEFAULT = Symbol('default');

module.exports = () => {
    const queues = new Map();

    const create = params => {
        let created = queue(params);
        queues.set((params.context && params.context.conId && params.context.conId.toString()) || DEFAULT, created);
        return created;
    };

    return {
        create,
        get: context => queues.get((context && context.conId && context.conId.toString()) || DEFAULT),
        delete: context => {
            let id = (context && context.conId) || DEFAULT;
            let destroy = queues.get(id);
            if (destroy) {
                queues.delete(id);
                destroy.destroy();
            }
        }
    };
};
