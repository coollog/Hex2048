// import 'DrawTimer'
// import 'InputDirection'
// import 'HexagonAnimated'

/**
 * Controls the state of the game.
 */
class Controller {
  constructor(board) {
    this.state = new Controller.StartingState();
    
    // Attach event handlers.
    Events.on(Controller.EVENT_TYPES.INPUT_DIRECTION, this._input, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._step, this, 0);
  }
  
  get board() {
    return this._board;
  }
  set board(board) {
    this._board = board;
  }
  
  set state(newState) {
    this._state = newState;
    newState.controller = this;
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
  STARTING: 0,
  READY: 1,
  ANIMATING: 2, // When the tiles are animating.
};

Controller.EVENT_TYPES = {
  INPUT_DIRECTION: 'controller-input-direction'
};

/**
 * Represents a state of the Controller.
 * Extend this class to implement new states.
 *  handleInput - handles an InputDirection.
 *  step - runs every draw step.
 *  _controllerReady - runs when the state is attached to the Controller.
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
    
    this._controllerReady();
  }
  
  handleInput(direction) {
    // Do nothing by default.
  }
  
  step() {
    // Do nothing by default.
  }
  
  _controllerReady() {
    // Do nothing by default.
  }
};

/**
 * Represents the STARTING state.
 */
Controller.StartingState = class extends Controller.State {
  constructor() {
    super(Controller.STATES.STARTING);
  }
  
  _controllerReady() {
    const board = new Board(canvas, new Coordinate(340, 340), 4, 50);
    // Start drawing the board
    board.createAll();
    
    // Generate a new board
    for (let i = 0; i < 30; i ++) {
      board.addRandom();
    }
    
    this._controller.board = board;
    
    this._controller.state = new Controller.ReadyState();
  }
}

/**
 * Represents the READY state.
 */
Controller.ReadyState = class extends Controller.State {
  constructor() {
    super(Controller.STATES.READY);
  }
  
  handleInput(direction) {
    // Start animating the board toward the input direction.
    let collapsed = this._controller.board.collapse(direction.direction);
    
    if (!collapsed.changed) return;
    
    this._controller.state = new Controller.AnimatingState(collapsed.result);
  }
};

/**
 * Represents the ANIMATING state.
 */
Controller.AnimatingState = class extends Controller.State {
  constructor(collapsedResult) {
    super(Controller.STATES.ANIMATING);
    
    this._collapsedResult = collapsedResult;
    
    // Time steps for animation.
    this._animated = 0;
  }
  
  // Animates the board toward the collapsed result.
  step() {
    if (this._animated === Controller.AnimatingState.ANIMATE_MAX) {
      this._finish();
    } else {
      this._animated ++;
      this._updateAnimatingHexagons();
    }
  }
  
  _controllerReady() {
    this._createAnimatingHexagons();
  }
  
  _createAnimatingHexagons() {
    this._hexagons = [];
    
    for (let row = 0; row < this._collapsedResult.length; row ++) {
      for (let col = 0; col < this._collapsedResult.length; col ++) {
        const {before, after, change} = this._collapsedResult[row][col];
        if (before === undefined) continue;
        
        // Stop any blinking.
        this._controller.board.hexagons[row][col].endBlink();
        
        const [newRow, newCol] = change;
        // Don't animate if original is blank.
        if (before === '') continue;
        
        // Disable original's drawing if changed position.
        if (row !== newRow || col !== newCol) {
          this._controller.board.hexagons[row][col].disableDrawing();
        }
        
        // If stay in same position, draw with lower priority.
        const samePosition = row === newRow && col === newCol;
        const zIndex = samePosition ? 10 : 11;
        
        const hexagon = new HexagonAnimated(
            this._controller.board.canvas, 
            this._controller.board.radius - Hexagon.SPACING, 
            this._controller.board.indexToXY(row, col), 
            this._controller.board.indexToXY(newRow, newCol),
            zIndex);
        hexagon.text = this._collapsedResult[row][col].before;
        this._hexagons.push(hexagon);
      }
    }
  }
  
  _updateAnimatingHexagons() {
    for (let hexagon of this._hexagons) {
      hexagon.animate(this._animated / Controller.AnimatingState.ANIMATE_MAX);
    }
  }
  
  _finish() {
    // Delete all animating hexagons.
    for (let hexagon of this._hexagons) {
      hexagon.delete();
    }
    this._hexagons = [];
    
    // Reenable drawing for all hexagons.
    for (let row = 0; row < this._collapsedResult.length; row ++) {
      for (let col = 0; col < this._collapsedResult.length; col ++) {
        if (this._controller.board.hexagons[row][col] === undefined) continue;
        this._controller.board.hexagons[row][col].enableDrawing();
      }
    }
    
    // Update board to be the result.
    this._controller.board
      .updateWithResult(this._collapsedResult)
      .addRandom();
    this._controller.state = new Controller.ReadyState();
  }
};

// Total time steps for animation.
Controller.AnimatingState.ANIMATE_MAX = 20;
