/**
 * An event dispatcher that redirects events with data.
 */
class Events {
  // Attach 'handler' to be called when event of type 'eventType' is received.
  static on(eventType, handler) {
    if (!(eventType in Events._events)) {
      Events._events[eventType] = [ handler ];
    } else {
      Events._events[eventType].push(handler);
    }
  }

  // Detach any handlers from event of type 'eventType'.
  static off(eventType) {
    delete Events._events[eventType];
  }

  // Dispatch an event with type 'eventType' containing data '...data'.
  static dispatch(eventType, ...data) {
    if (!(eventType in Events._events)) return;

    const handlers = Events._events[eventType];
    for (const handler of handlers) {
      handler(...data);
    }
  }
}

// Holds the dictionary of events. 
// Key is the event type, value is the array of handlers.
Events._events = {};