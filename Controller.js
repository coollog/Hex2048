// import 'DrawTimer'
// import 'InputDirection'
// import 'HexagonAnimated'

/**
 * Controls the state of the game.
 */
class Controller {
  constructor(game, gestureHandler, clickHandler) {
    this._game = game;
    this._gestureHandler = gestureHandler;
    this._clickHandler = clickHandler;
    
    // this.state = new Controller.StartingState();
    this.state = new Controller.HomeState();
    
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
  ANIMATING: 2,   // When the tiles are animating.
  HOME: 3,        // Home page (start, view high score)
  HIGH_SCORE: 4,  // View high scores
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
    
    // Enable gesture drawing
    this._controller._gestureHandler.drawOn = true;
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
        
        // Disable original's drawing.
        this._controller.board.hexagons[row][col].disableDrawing();
        
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
Controller.AnimatingState.ANIMATE_MAX = 15;

/**
 * Represents the HOME state.
 */
Controller.HomeState = class extends Controller.State {
  constructor() {
    super(Controller.STATES.HOME);
    
  }
  
  _controllerReady() {
    this._controller = this._controller;
    
    // Disable gesture drawing
    this._controller._gestureHandler.drawOn = false;
    
    let controller = this._controller;
    const home = new Home(canvas, this._controller._game, this._controller._clickHandler,
        start, highScores);
        
    // Change state to start
    function start() {
      controller.state = new Controller.StartingState();
    }
    
    // Change state to high scores
    function highScores() {
      controller.state = new Controller.HighScoreState();
    }
  }
}

/**
 * Represents the HIGH SCORE state.
 */
Controller.HighScoreState = class extends Controller.State {
  constructor() {
    super(Controller.STATES.HIGH_SCORE);
    
  }
  
  _controllerReady() {
    this._controller = this._controller;
    
    // Disable gesture drawing
    this._controller._gestureHandler.drawOn = false;
    
    let controller = this._controller;
    const highScore = new HighScore(canvas, this._controller._game,
        this._controller._clickHandler, backToHome);
        
    // Change state back to home
    function backToHome() {
      controller.state = new Controller.HomeState();
    }
  }
}