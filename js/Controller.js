// import 'DrawTimer'
// import 'InputDirection'
// import 'HexagonAnimated'

/**
 * Controls the state of the game.
 */
class Controller {
  constructor() {
    assertParameters(arguments);
    
    // this.state = new Controller.StartingState();
    this.state = new Controller.HomeState();
    
    // Attach event handlers.
    Events.on(Controller.EVENT_TYPES.INPUT_DIRECTION, this._input, this);
    Events.on(DrawTimer.EVENT_TYPES.STEP, this._step, this, 0);
  }
  
  // TODO: Board should live with the corresponding states, NOT in Controller.
  get board() {
    return this._board;
  }
  set board(board) {
    assertParameters(arguments, Board);
    
    this._board = board;
  }
  
  set state(newState) {
    assertParameters(arguments, Controller.State);
    
    if (this._state) this._state.finish();
    this._state = newState;
    newState.controller = this;
  }
  
  // Handles an input direction.
  _input(direction) {
    assertParameters(arguments, InputDirection);
    
    this._state.handleInput(direction);
  }
  
  _step() {
    assertParameters(arguments);
    
    this._state.step();
  }
}

Controller.STATES = {
  STARTING: 0,
  READY: 1,
  ANIMATING: 2,   // When the tiles are animating.
  HOME: 3,        // Home page (start, view high score)
  HIGH_SCORE: 4,  // View high scores
  LOST: 5         // Player lost
};

Controller.EVENT_TYPES = {
  INPUT_DIRECTION: 'controller-input-direction'
};

/**
 * Represents a state of the Controller.
 * Extend this class to implement new states.
 *  handleInput - handles an InputDirection.
 *  step - runs every draw step.
 *  finish - runs when the state is changed.
 *  _controllerReady - runs when the state is attached to the Controller.
 */
Controller.State = class {
  constructor(type) {
    assertParameters(arguments, Controller.STATES);
    
    this._type = type;
  }
  
  get type() {
    return this._type;
  }
  
  set controller(controller) {
    assertParameters(arguments, Controller);
    
    this._controller = controller;
    
    this._controllerReady();
  }
  
  handleInput(direction) {
    assertParameters(arguments, InputDirection);
    
    // Do nothing by default.
  }
  
  step() {
    assertParameters(arguments);
    
    // Do nothing by default.
  }
  
  finish() {
    assertParameters(arguments);
    
    // Do nothing by default.
  }
  
  _controllerReady() {
    assertParameters(arguments);
    
    // Do nothing by default.
  }
};

/**
 * Represents the STARTING state.
 */
Controller.StartingState = class extends Controller.State {
  constructor() {
    assertParameters(arguments);
    
    super(Controller.STATES.STARTING);
  }
  
  _controllerReady() {
    assertParameters(arguments);
    
    const board = new Board(canvas, new Coordinate(340, 340), 3, 60);
    // Start drawing the board.
    board.createAll();
    
    // Generate a new board.
    // TODO: Move into board. Call it initRandom().
    for (let i = 0; i < 6; i ++) {
      board.addRandom();
    }
    
    this._controller.board = board;
    
    // Enable gesture drawing.
    Events.dispatch(GestureHandler.EVENT_TYPES.ON);
    
    this._controller.state = new Controller.ReadyState();
  }
};

/**
 * Represents the READY state.
 */
Controller.ReadyState = class extends Controller.State {
  constructor() {
    assertParameters(arguments);
    
    super(Controller.STATES.READY);
  }
  
  handleInput(direction) {
    assertParameters(arguments, InputDirection);
    
    // Start animating the board toward the input direction.
    let collapsed = this._controller.board.collapse(direction.direction);
    
    if (!collapsed.changed) return;
    
    this._controller.state = new Controller.AnimatingState(collapsed.result);
  }
  
  finish() {
    Events.off(Board.EVENT_TYPES.GOTO_HOME, this);
    Events.off(Board.EVENT_TYPES.GOTO_STARTING, this);
  }
  
  _controllerReady() {
    assertParameters(arguments);
    
    Events.on(Board.EVENT_TYPES.GOTO_HOME, this._backToHome, this);
    Events.on(Board.EVENT_TYPES.GOTO_STARTING, this._backToStarting, this);
  }
  
  // Change state back to home
  _backToHome() {
    assertParameters(arguments);
    
    this._controller.board.remove();
    
    this._controller.state = new Controller.HomeState();
  }
  
  // Change state back to home
  _backToStarting() {
    assertParameters(arguments);
    
    this._controller.board.remove();
    
    this._controller.state = new Controller.StartingState();
  }
};

/**
 * Represents the ANIMATING state.
 */
Controller.AnimatingState = class extends Controller.State {
  constructor(collapsedResult) {
    assertParameters(arguments, Object);
    
    super(Controller.STATES.ANIMATING);
    
    this._collapsedResult = collapsedResult;
    
    // Time steps for animation.
    this._animated = 0;
  }
  
  // Animates the board toward the collapsed result.
  step() {
    assertParameters(arguments);
    
    if (this._animated === Controller.AnimatingState.ANIMATE_MAX) {
      this._animationFinished();
    } else {
      this._animated ++;
      this._updateAnimatingHexagons();
    }
  }
  
  _controllerReady() {
    assertParameters(arguments);
    
    this._createAnimatingHexagons();
  }
  
  _createAnimatingHexagons() {
    assertParameters(arguments);
    
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
    assertParameters(arguments);
    
    for (let hexagon of this._hexagons) {
      hexagon.animate(this._animated / Controller.AnimatingState.ANIMATE_MAX);
    }
  }
  
  _animationFinished() {
    assertParameters(arguments);
    
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
    this._controller.board.updateWithResult(this._collapsedResult);
    for (let i = 0; i < 2; i++) {
      // If cannot add the needed number of new blocks, then player lost
      if (this._controller.board.numberOpen() < 1) {
        this._lost();
        return;
      }
      
      this._controller.board.addRandom();
    }
      
    // Check if lost 
    if (this._controller.board.lost()) {
      this._lost();
    } else {
      this._controller.state = new Controller.ReadyState();
    }
  }
  
  // Called when the player lost
  _lost() {
    // Disable gesture drawing
    Events.dispatch(GestureHandler.EVENT_TYPES.OFF);
    this._controller.board.remove();

    this._controller.state = new Controller.LostState();
  }
};

// Total time steps for animation.
Controller.AnimatingState.ANIMATE_MAX = 15;

/**
 * Represents the HOME state.
 */
Controller.HomeState = class extends Controller.State {
  constructor() {
    assertParameters(arguments);
    
    super(Controller.STATES.HOME);
  }
  
  finish() {
    assertParameters(arguments);
    
    this._home.remove();
    Events.off(Home.EVENT_TYPES.GOTO_STARTING, this);
    Events.off(Home.EVENT_TYPES.GOTO_HIGH_SCORE, this);
  }
  
  _controllerReady() {    
    assertParameters(arguments);

    this._home = new Home(canvas);
    Events.on(Home.EVENT_TYPES.GOTO_STARTING, this._start, this);
    Events.on(Home.EVENT_TYPES.GOTO_HIGH_SCORE, this._highScores, this);
  }

  // Change state to start
  _start() {
    assertParameters(arguments);
    
    this._controller.state = new Controller.StartingState();
  }
    
    // Change state to high scores
  _highScores() {
    assertParameters(arguments);
    
    this._controller.state = new Controller.HighScoreState();
  }
};

/**
 * Represents the HIGH SCORE state.
 */
Controller.HighScoreState = class extends Controller.State {
  constructor(name = undefined, rank = undefined) {
    assertParameters(arguments, [String, undefined], [Number, undefined]);
    
    super(Controller.STATES.HIGH_SCORE);

    this._name = name;
    this._rank = rank;
  }
  
  finish() {
    Events.off(HighScore.EVENT_TYPES.GOTO_HOME, this);
  }
  
  _controllerReady() {
    assertParameters(arguments);
  
    this._highScore = new HighScore(canvas, this._name, this._rank);
    Events.on(HighScore.EVENT_TYPES.GOTO_HOME, this._backToHome, this);
  }

  // Change state back to home
  _backToHome() {
    assertParameters(arguments);
    
    this._highScore.remove();
    
    Events.off(HighScore.EVENT_TYPES.GOTO_HOME, this);
    this._controller.state = new Controller.HomeState();
  }
};

/**
 * Represents the LOST state.
 */
Controller.LostState = class extends Controller.State {
  constructor() {
    assertParameters(arguments);
    
    super(Controller.STATES.LOST);
  }
  
  step() {
    
  }
  
  finish() {
    assertParameters(arguments);
    
    this._lost.remove();
    
    Events.off(Lost.EVENT_TYPES.GOTO_HIGH_SCORE, this);
    Events.off(Lost.EVENT_TYPES.GOTO_HOME, this);
  }
  
  _controllerReady() {
    assertParameters(arguments);
    
    this._lost = new Lost(canvas, this._controller.board);
    
    Events.on(Lost.EVENT_TYPES.GOTO_HIGH_SCORE, this._highScores, this);
    Events.on(Lost.EVENT_TYPES.GOTO_HOME, this._backToHome, this);
  }
        
  // Change state back to home
  _backToHome() {
    assertParameters(arguments);
    
    this._controller.state = new Controller.HomeState();
  }
  
  // Submitted so display high scores
  _highScores(data = undefined) {
    assertParameters(arguments, [Array, undefined]);
    
    const name = (data === undefined) ? undefined : data[0];
    const rank = (data === undefined) ? undefined : data[1];
    
    this._controller.state = new Controller.HighScoreState(name, rank);
  }
};
