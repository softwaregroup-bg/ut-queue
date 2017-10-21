# UT Queue

Generic queue functionality

## Scope

- Prioritization of messages
- Overflow handling
- Rate limiting
- Timeout handling
- Metrics

## API

This exports 1 APIs:

```javascript
{
    queues
}
```

## Queue public API

### ```queues()``` - Returns the below API

### ```queues.create({context, callback})``` - creates a queue

- ```context``` - associate the queue with the passed context.conId or create a default queue
- ```callback``` - optionally call this when queue ends

### ```queues.get(context)``` - finds a queue

- ```context``` - the context with which the queue is associated by context.conId or a return the default queue if context or context.conId is falsy value

### ```queues.delete(context)``` - ends a queue

- ```context``` - the context with which the queue is associated by context.conId or a end the default queue if context or context.conId is falsy value

### ```queues.count()``` - returns the count of queues
