/**
 * An event dispatcher that redirects events with data.
 */
class Events {
  // Attach 'handler' to be called when event of type 'eventType' is received.
  // The handler is cslled with this as 'owner'.
  static on(eventType, handler, owner) {
    // Create a new map from owner to handlers if the eventType is new.
    if (!(eventType in Events._events)) {
      Events._events[eventType] = new Map();
    }
    // Create a new handler list for a new owner.
    if (!Events._events[eventType].has(owner)) {
      Events._events[eventType].set(owner, []);
    }
    // Add the handler to the owner's handler list.
    Events._events[eventType].get(owner).push(handler);
  }

  // Detach any handlers from event of type 'eventType' for 'owner'.
  static off(eventType, owner = null) {
    if (owner === null) {
      delete Events._events[eventType];
    } else {
      Events._events[eventType].delete(owner);s
    }
  }

  // Dispatch an event with type 'eventType' containing data '...data'.
  static dispatch(eventType, ...data) {
    if (!(eventType in Events._events)) return;

    const ownerHandlersMap = Events._events[eventType];
    let owner, handlers;
    for ([owner, handlers] of ownerHandlersMap) {
      for (let handler of handlers) {
        handler.call(owner, ...data);
      }
    }
  }
}

// Holds the dictionary of events. 
// Key is the event type, value is the array of handlers.
Events._events = {};