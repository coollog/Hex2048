// import 'Controller'
// import 'InputHandler'
// import 'InputDirection'

/**
 * Handles the keyboard inputs as directions.
 */
class KeyHandler {
  constructor() {
    // Attach event listeners.
    Events.on(InputHandler.EVENT_TYPES.KEY, this._key, this);
  }
  
  // Dispatches the corresponding input direction event.
  _key(keyChar) {
    let direction = KeyHandler.KEY_TO_DIRECTION_MAP[keyChar];
    const inputDirection = new InputDirection(direction);
    Events.dispatch(Controller.EVENT_TYPES.INPUT_DIRECTION, inputDirection);
  }
};

KeyHandler.KEY_TO_DIRECTION_MAP = {
  Q: InputDirection.DIRECTIONS.TOP_LEFT,
  W: InputDirection.DIRECTIONS.UP,
  E: InputDirection.DIRECTIONS.TOP_RIGHT,
  D: InputDirection.DIRECTIONS.BOTTOM_RIGHT,
  S: InputDirection.DIRECTIONS.DOWN,
  A: InputDirection.DIRECTIONS.BOTTOM_LEFTs
};
