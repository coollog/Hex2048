class HighScore {
  constructor(canvas) {
    this._canvas = canvas;
    
    // Get high scores
    this._haveHighScores = false;
    this._scores = [];
    this._getHighScores();
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
    
    // Create backToHome button
    const butBackToHomeEnv = HighScore._getBackToHomeButtonEnvelope(this._canvas);

    this._butBackToHome = new Button(
          this._canvas, butBackToHomeEnv,HighScore._HOME_TEXT);
    this._butBackToHome.onClick(this._backToHome.bind(this));
  }
  
  static get _BUTTON_SIZE() {
    return new Size(HighScore._BUTTON_WIDTH, HighScore._BUTTON_HEIGHT);
  }
  
  static _getBackToHomeButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .translate(new Coordinate(-(HighScore._BUTTON_WIDTH + 50), 0))
        .translate(new Coordinate(0, -(HighScore._BUTTON_HEIGHT + 50)));
        
    return new Envelope(topLeft, HighScore._BUTTON_SIZE);
  }
  
  static _getTitleCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/HighScore._HEIGHT_SCALE);
        
    return topLeft;
  }
  
  static _getHighScoreCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = HighScore._getTitleCoord(canvas)
        .translate(new Coordinate(0, 50));
        
    return topLeft;
  }
  
  static _getRankCoord(canvas, position) {
    assertParameters(arguments, Canvas, Number);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/HighScore._HEIGHT_SCALE)
        .translate(new Coordinate(-150, 100 + 30 * position));
        
    return topLeft;
  }
  
  static _getNameCoord(canvas, position) {
    assertParameters(arguments, Canvas, Number);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/HighScore._HEIGHT_SCALE)
        .translate(new Coordinate(-110, 100 + 30 * position));
        
    return topLeft;
  }
  
  static _getScoreCoord(canvas, position) {
    assertParameters(arguments, Canvas, Number);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/HighScore._HEIGHT_SCALE)
        .translate(new Coordinate(150, 100 + 30 * position));
        
    return topLeft;
  }
  
  static _getRetrieveCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/HighScore._HEIGHT_SCALE)
        .translate(new Coordinate(0, 140));
        
    return topLeft;
  }
  
  // Deactivate all events related to this page.
  remove() {
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    this._butBackToHome.remove();
  }
  
  _draw() {
    // Draw title
    this._canvas.drawText(HighScore._getTitleCoord(this._canvas),
        HighScore._TITLE_TEXT, 'center', HighScore._TITLE_FONT);
    
    // Draw high score
    this._canvas.drawText(HighScore._getHighScoreCoord(this._canvas),
        HighScore._HS_TEXT, 'center', HighScore._HS_FONT);
    
    // Get high scores
    if (this._haveHighScores) {
      for (let position = 1; position <= this._scores.length; position ++) {
        let entry = this._scores[position - 1];
        
        this._canvas.drawText(HighScore._getRankCoord(this._canvas, position),
            position.toString(), 'left', HighScore._LEADERBOARD_FONT);
        this._canvas.drawText(HighScore._getNameCoord(this._canvas, position),
            entry.name, 'left', HighScore._LEADERBOARD_FONT);
        this._canvas.drawText(HighScore._getScoreCoord(this._canvas, position),
            entry.score.toString(), 'right', HighScore._LEADERBOARD_FONT);
      }
    } else {
      this._canvas.drawText(HighScore._getRetrieveCoord(this._canvas),
          HighScore._RETRIEVE_TEXT, 'center', HighScore._RETRIEVE_FONT);
    }
  }
  
  _backToHome(button) {
    // Prevent this from being activated multiple times
    button.disable();
    
    // Change state back to home
    Events.dispatch(HighScore.EVENT_TYPES.GOTO_HOME);
  }
  
  static callLambda(type, params = {}) {
    const LAMBDA_URL = 
        'https://7vm2om2s23.execute-api.us-east-1.amazonaws.com/prod/hex2048';
    
    const body = Object.assign({ type: type }, params);
    
    const request = {
    	method: 'POST',
    	body: JSON.stringify(body)
    };
    
    return fetch(LAMBDA_URL, request).then((res) => {
      return res.json();
    });
  }
  
  _getHighScores() {
    const LIMIT = 10;
    
    HighScore.callLambda('getScores', { limit: LIMIT }).then((res) => {
      if (res.success) {
        this._haveHighScores = true;
        for (let entry of res.scores) {
          this._scores.push(entry);
        }
      }
    }).catch((err) => {
      alert(err.message);
    });
  }
}

HighScore.EVENT_TYPES = {
  GOTO_HOME: 'high-score-goto-home'
};

HighScore._BUTTON_WIDTH = 100;
HighScore._BUTTON_HEIGHT = 30;
HighScore._HEIGHT_SCALE = 5;

HighScore._TITLE_TEXT = 'HEX2048';
HighScore._TITLE_FONT = '60px Arial';
HighScore._HS_TEXT = 'High Scores';
HighScore._HS_FONT = '40px Arial';
HighScore._RETRIEVE_TEXT = 'Retrieving Scores...';
HighScore._RETRIEVE_FONT = '28px Arial';
HighScore._HOME_TEXT = 'Home';
HighScore._LEADERBOARD_FONT = '20px Arial';