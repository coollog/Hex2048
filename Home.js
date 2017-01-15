// import 'Events'
// import 'DrawTimer'
// import 'Coordinate'
// import 'ClickHandler'

class Home {
  constructor(canvas, game, clickHandler) {
    this._canvas = canvas;
    this._game = game;
    this._clickHandler = clickHandler;
    
    // Fields to prevent button from being pressed twice
    this._started = false;
    this._highScored = false;
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  _draw() {
    const BUTTON_WIDTH = 120;
    const BUTTON_HEIGHT = 30;
    
    // Draw title
    const coordTitle = new Coordinate(this._game.width / 2, this._game.height / 3);
    this._canvas.drawText(coordTitle, 'HEX2048', 'center', '60px Arial');
    
    // Draw start button
    const butStartArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH) / 2, 
          this._game.height / 3 + 50),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    };
    this._canvas.drawButton(this._clickHandler, this, butStartArea, 'Start', 
        Home.BUTTONS.START, this._clickStart);
    
    // Draw high score button
    const butHighScoreArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH) / 2, 
          this._game.height / 3 + 90),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    };
    this._canvas.drawButton(this._clickHandler, this, butHighScoreArea, 'High Scores', 
        Home.BUTTONS.HIGH_SCORES, this._clickHighScores);
  }
  
  _clickStart() {
    if (this._started) return;
    
    // Prevent this from being activated multiple times
    this._started = true;
    
    // Deactivate the button
    Events.off(Home.BUTTONS.START);
    
    // Stop drawing this home page
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    
    // Change the state
    Events.dispatch(Home.EVENT_TYPES.GOTO_STARTING);
  }
  
  _clickHighScores() {
    if (this._highScored) return;
    
    // Prevent this from being activated multiple times
    this._highScored = true;
    
    // Deactivate the button
    Events.off(Home.BUTTONS.HIGH_SCORES);
    
    // Stop drawing this home page
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    
    // Change the state
    Events.dispatch(Home.EVENT_TYPES.GOTO_HIGH_SCORE);
  }
}

Home.BUTTONS = {
  START: 'button-home-start',
  HIGH_SCORES: 'button-home-high-score'
};

Home.EVENT_TYPES = {
  GOTO_STARTING: 'home-goto-starting',
  GOTO_HIGH_SCORE: 'home-goto-high-score'
};