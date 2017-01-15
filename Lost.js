class Lost {
  constructor(canvas, game, drawTimer, board, clickHandler) {
    this._canvas = canvas;
    this._game = game;
    this._drawTimer = drawTimer;
    this._board = board;
    this._clickHandler = clickHandler;
    
    // Fields to prevent button from being pressed twice
    this._highScored = false;
    this._backed = false;
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  _draw() {
    const BUTTON_WIDTH = 100;
    const BUTTON_HEIGHT = 38;
    const INPUT_WIDTH = 150;
    const INPUT_HEIGHT = 25;
    const HEIGHT_SCALE = 4;
    const MIDDLE = this._game.width / 2;
    
    // Draw title
    const coordTitle = new Coordinate(MIDDLE, this._game.height / HEIGHT_SCALE);
    this._canvas.drawText(coordTitle, 'HEX2048', 'center', '60px Arial');
    
    // Draw your score: #
    const coordHS = new Coordinate(MIDDLE, this._game.height / HEIGHT_SCALE + 90);
    this._canvas.drawText(coordHS, ('Your Score: ' + this._board.score), 'center', '40px Arial');
    
    // Add in text input for name
    this._input = new CanvasInput({
      canvas: this._game,
      x: MIDDLE - INPUT_WIDTH,
      y: this._game.height / HEIGHT_SCALE + 130,
      width: INPUT_WIDTH,
      height: INPUT_HEIGHT,
      placeHolder: 'Name'
    });
    
    // Draw submit button
    const butSubmitArea = {
      coord: new Coordinate((MIDDLE + 45), 
          this._game.height / HEIGHT_SCALE + 130),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    };
    this._canvas.drawButton(this._clickHandler, this, butSubmitArea, 'Submit', 
        Lost.BUTTONS.SUBMIT, this._submit);
    
    // Draw back button
    const butHomeArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH - 50), 
          this._game.height - BUTTON_HEIGHT - 50),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    };
    this._canvas.drawButton(this._clickHandler, this, butHomeArea, 'Home', 
        Lost.BUTTONS.HOME, this._backToHome);
    
    // Need to disable further drawing or else input will not work
    this._drawTimer.stop();
  }
  
  _submit() {
    if (this._submitted) return;
    
    const data = {
      name: this._input.value(),
      score: this._board.score
    };

    // Make sure an actual name was inputted
    if (data.name === '') return;

    // Restart the drawTimer
    this._drawTimer.start();
    
    HighScore.callLambda('addScore', data).then((res) => {
      if (res.success) {
        HighScore.callLambda('getRank', {score: data.score}).then((res) => {
          if (res.success) {
            console.log(res.rank);
            
            // Go to high scores
            Events.dispatch(Lost.EVENT_TYPES.GOTO_HIGH_SCORE);
          }
        });
      }
    }).catch((err) => {
      alert(err.message);
    });
  }
  
  _backToHome() {
    if (this._backed) return;
    
    // Prevent this from being activated multiple times
    this._backed = true;
    
    // Deactivate the button
    Events.off(Lost.BUTTONS.HOME);
    
    // Stop drawing this high score page
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    
    // Restart the drawTimer
    this._drawTimer.start();

    // Go back to home (which will change the state)
    Events.dispatch(Lost.EVENT_TYPES.GOTO_HOME);
  }
}

Lost.BUTTONS = {
  SUBMIT: 'button-lost-submit',
  HOME: 'button-lost-home'
}

Lost.EVENT_TYPES = {
  GOTO_HOME: 'lost-goto-home',
  GOTO_HIGH_SCORE: 'lost-goto-high-score'
};