/**
 * Controls the state of the game.
 */
class Controller {
  constructor(board) {
    this._board = board;
    this._state = Controller.STATES.READY;
    
    // Attach event handlers.
    Events.on(Controller.EVENT_TYPES.INPUT_DIRECTION, this._input, this);
  }
  
  // Handles an input direction.
  _input(direction) {
    // Can only gesture if ready.
    if (this._state !== Controller.STATES.READY) return;
    
    // Start animating the board toward the input direction.
    let collapsed = this._board.collapse(direction.direction);
    if (collapsed.changed) {
      this._board.updateWithResult(collapsed.result);
      board.addRandom();
    }
  }
};

Controller.STATES = {
  READY: 0,
  ANIMATING: 1, // When the tiles are animating.
};

Controller.EVENT_TYPES = {
  INPUT_DIRECTION: 'controller-input-direction'
};