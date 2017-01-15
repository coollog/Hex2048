class HighScore {
  constructor(canvas, game, clickHandler, backToHome) {
    this._canvas = canvas;
    this._game = game;
    this._clickHandler = clickHandler;
    
    // Controller functions
    this._backToHome = backToHome;
    
    // Fields to prevent button from being pressed twice
    this._backed = false;
    
    // Get high scores
    this._haveHighScores = false;
    this._scores = [];
    this._getHighScores();
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  _draw() {
    const BUTTON_WIDTH = 100;
    const BUTTON_HEIGHT = 30;
    
    // Draw title
    const coordTitle = new Coordinate(this._game.width / 2, this._game.height / 3);
    this._canvas.drawText(coordTitle, 'HEX2048', 'center', '60px Arial');
    
    // Draw high score
    const coordHS = new Coordinate(this._game.width / 2, this._game.height / 3 + 50);
    this._canvas.drawText(coordHS, 'High Scores', 'center', '40px Arial');
    
    // Define x values for: rank (left align), name (left), score (right)
    const xRank = this._game.width / 2 - 150;
    const xName = this._game.width / 2 - 110;
    const xScore = this._game.width / 2 + 150;
    
    // Get high scores
    if (this._haveHighScores) {
      let scoreCoord;
      let y = this._game.height / 3 + 130;
      for (let i = 0; i < this._scores.length; i ++) {
        let entry = this._scores[i];
        
        this._canvas.drawText(new Coordinate(xRank, y), (i + 1), 'left', '20px Arial');
        this._canvas.drawText(new Coordinate(xName, y), entry.name, 'left', '20px Arial');
        this._canvas.drawText(new Coordinate(xScore, y), entry.score, 'right', '20px Arial');
        
        y += 30;
      }
    } else {
      let x = this._game.width / 2;
      let y = this._game.height / 3 + 130;
      this._canvas.drawText(new Coordinate(x, y), 'Retrieving Scores...', 'center', '30px Arial');
    }
    
    // Draw back button
    const butHomeArea = {
      coord: new Coordinate((this._game.width - BUTTON_WIDTH - 50), 
          this._game.height - BUTTON_HEIGHT - 50),
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
    }
    this._canvas.drawButton(this._clickHandler, this, butHomeArea, 'Home', 
        HighScore.BUTTONS.HOME, this._backToHome);
  }
  
  _backToHome() {
    if (!this._backed) {
      // Prevent this from being activated multiple times
      this._backed = true;
      
      // Deactivate the button
      Events.off(HighScore.BUTTONS.HOME);
      
      // Stop drawing this high score page
      Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
      
      // Call backToHome (which will change the state)
      this._backToHome();
    }
  }
  
  static _callLambda(type, params = {}) {
    const LAMBDA_URL = 
        'https://7vm2om2s23.execute-api.us-east-1.amazonaws.com/prod/hex2048';
    
    const body = Object.assign({ type: type }, params);
    
    const request = {
    	method: 'post',
    	body: JSON.stringify(body)
    };
    
    return fetch(LAMBDA_URL, request).then((res) => {
      return res.json();
    });
  }
  
  _getHighScores() {
    const LIMIT = 10;
    
    HighScore._callLambda('getScores', { limit: LIMIT }).then((res) => {
      console.log(res);
      if (res.success) {
        this._haveHighScores = true;
        for (let entry of res.scores) {
          this._scores.push(entry)
        }
      }
    }).catch((err) => {
      alert(err.message);
    });
  }
}

HighScore.BUTTONS = {
  HOME: 'button-high-score-home'
} 