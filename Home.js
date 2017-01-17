// import 'Events'
// import 'DrawTimer'
// import 'Coordinate'
// import 'ClickHandler'

class Home {
  constructor(canvas) {
    assertParameters(arguments, Canvas);
    
    this._canvas = canvas;
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
    
    // Create start and high score buttons
    const butStartEnv = Home._getStartButtonEnvelope(this._canvas);
    const butHighScoreEnv = Home._getHighScoreButtonEnvelope(this._canvas);

    this._butStart = new Button(this._canvas, butStartEnv, Home._START_TEXT);
    this._butHighScore = new Button(
        this._canvas, butHighScoreEnv, Home._HIGH_SCORES_TEXT);
    
    this._butStart.onClick(this._clickStart.bind(this));
    this._butHighScore.onClick(this._clickHighScores.bind(this));
  }
  
  static get _BUTTON_SIZE() {
    return new Size(Home._BUTTON_WIDTH, Home._BUTTON_HEIGHT);
  }
  
  static _getStartButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .translate(new Coordinate(-Home._BUTTON_WIDTH, 0))
        .scale(1/2, 1/3)
        .translate(new Coordinate(0, 50));
        
    return new Envelope(topLeft, Home._BUTTON_SIZE);
  }
  
  static _getHighScoreButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .translate(new Coordinate(-Home._BUTTON_WIDTH, 0))
        .scale(1/2, 1/3)
        .translate(new Coordinate(0, 90));
        
    return new Envelope(topLeft, Home._BUTTON_SIZE);
  }
  
  static _getTitleCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/3);
        
    return topLeft;
  }
  
  
  // Deactivate all events related to this page.
  remove() {
    assertParameters(arguments);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    this._butStart.remove();
    this._butHighScore.remove();
  }
  
  _draw() {
    assertParameters(arguments);
    
    // Draw title
    const coordTitle = Home._getTitleCoord(this._canvas);
    this._canvas.drawText(coordTitle, Home._TITLE_TEXT, 'center', Home._TITLE_FONT);
  }
  
  _clickStart(button) {
    assertParameters(arguments, Button);

    // Prevent this from being activated multiple times
    button.disable();
    
    // Change the state
    Events.dispatch(Home.EVENT_TYPES.GOTO_STARTING);
  }
  
  _clickHighScores(button) {
    assertParameters(arguments, Button);
    
    // Prevent this from being activated multiple times
    button.disable();
    
    // Change the state
    Events.dispatch(Home.EVENT_TYPES.GOTO_HIGH_SCORE);
  }
}

Home.EVENT_TYPES = {
  GOTO_STARTING: 'home-goto-starting',
  GOTO_HIGH_SCORE: 'home-goto-high-score'
};

Home._BUTTON_WIDTH = 120;
Home._BUTTON_HEIGHT = 30;

Home._TITLE_TEXT = 'HEX2048';
Home._TITLE_FONT = '60px Arial';
Home._START_TEXT = 'Start';
Home._HIGH_SCORES_TEXT = 'High Scores';
