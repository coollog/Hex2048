/**
 * Controls the state of the game.
 */
class Controller {
  constructor() {
    this._state = Controller.STATES.READY;
    
    // Attach event handlers.
    Events.on(GestureHandler.EVENT_TYPES.DIRECTION, this._gesture.bind(this));
  }
  
  // Handles a gesture.
  _gesture(gesture) {
    // Can only gesture if ready.
    if (this._state !== Controller.STATES.READY) return;
    
    // Start animating the board toward the gesture direction.
  }
};

Controller.STATES = {
  READY: 0,
  ANIMATING: 1, // When the tiles are animating.
};
