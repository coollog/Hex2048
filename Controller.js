// import 'DrawTimer'
// import 'InputDirection'

/**
 * Controls the state of the game.
 */
class Controller {
  constructor(board) {
    this._board = board;
    this.state = new Controller.ReadyState();
    
    // Attach event handlers.
    Events.on(Controller.EVENT_TYPES.INPUT_DIRECTION, this._input, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._step, this, 0);
  }
  
  set state(newState) {
    newState.controller = this;
    this._state = newState;
  }
  
  // Handles an input direction.
  _input(direction) {
    this._state.handleInput(direction);
  }
  
  _step() {
    this._state.step();
  }
};

Controller.STATES = {
  READY: 0,
  ANIMATING: 1, // When the tiles are animating.
};

Controller.EVENT_TYPES = {
  INPUT_DIRECTION: 'controller-input-direction'
};

/**
 * Represents a state of the Controller.
 */
Controller.State = class {
  constructor(type, controller) {
    this._type = type;
    this._controller = controller;
  }
  
  get type() {
    return this._type;
  }
  
  set controller(controller) {
    this._controller = controller;
  }
  
  handleInput(direction) {
    // Do nothing by default.
  }
  
  step() {
    // Do nothing by default.
  }
};

/**
 * Represents the READY state.
 */
Controller.ReadyState = class extends Controller.State {
  constructor() {
    super(Controller.STATES.READY);
  }
  
  handleInput(direction) {
    // Start animating the board toward the input direction.
    let collapsed = this._controller._board.collapse(direction.direction);
    if (!collapsed.changed) return;
    
    this._controller.state = new Controller.AnimatingState(collapsed);
  }
};

/**
 * Represents the ANIMATING state.
 */
Controller.AnimatingState = class extends Controller.State {
  constructor(collapsed) {
    super(Controller.STATES.ANIMATING);
    
    this._collapsed = collapsed;
  }
  
  // Animates the board toward the collapsed result.
  step() {
    this._controller._board
        .updateWithResult(this._collapsed.result)
        .addRandom();
    this._controller.state = new Controller.ReadyState();
  }
}
