// import 'Events'
// import 'DrawTimer'
// import 'Coordinate'
// import 'ClickHandler'

class Home {
  constructor(canvas, game, clickHandler, start) {
    this._canvas = canvas;
    this._game = game;
    this._clickHandler = clickHandler;
    
    // Controller functions
    this._start = start;
    
    // Fields to prevent button from being pressed twice
    this._started = false;
    this._highScored = false;
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  _draw() {
    const BUTTON_WIDTH = 120;
    const BUTTON_HEIGHT = 30;
    
    const coordTitle = new Coordinate(this._game.width / 2, this._game.height / 3);
    
    // Draw title
    this._canvas.drawText(coordTitle, 'HEX2048', 'center', '60px Arial');
    
    // Draw start button
    const butStartArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH) / 2, 
          this._game.height / 3 + 50),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    }
    this._drawButton(butStartArea, 'Start', Home.BUTTONS.START, this._clickStart);
    
    // Draw high score button
    const butHighScoreArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH) / 2, 
          this._game.height / 3 + 90),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    }
    this._drawButton(butHighScoreArea, 'High Scores', Home.BUTTONS.HIGH_SCORES, this._clickHighScores);
  }
  
  _drawButton(area, text, button, callBackFunc) {
    this._canvas.drawStrokeRect(area.coord, area.width, area.height);
    
    let center = new Coordinate(area.coord.x + area.width / 2,
        area.coord.y + area.height / 2);
    this._canvas.drawText(center, text, 'center', '20px Arial');
    
    this._clickHandler.registerArea(area, button);
    Events.on(button, callBackFunc, this);
  }
  
  _clickStart() {
    if (!this._started) {
      // Prevent this from being activated multiple times
      this._started = true;
      
      // Deactivate the button
      Events.off(Home.BUTTONS.START);
      
      // Stop drawing this home page
      Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
      
      // Call start (which will change the state);
      this._start();
    }
  }
  
  _clickHighScores() {
    if (!this._highScored) {
      // Prevent this from being activated multiple times
      this._highScored = true;
      
      // Deactivate the button
      Events.off(Home.BUTTONS.HIGH_SCORES);
      
      // Stop drawing this home page
      Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
      
      // Call start (which will change the state);
      // this._start();
    }
  }
}

Home.BUTTONS = {
  START: 'button-home-start',
  HIGH_SCORES: 'button-home-high-score'
} 