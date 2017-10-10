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
    queue
}
```

## Queue public API

### queue(config, event, registerCounter, end, log)

### queue.destroy()

### queue.add(messageAndMeta)

### queue.ping()

### queue.stream()

### queue.push(messageAndMeta)
