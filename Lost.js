class Lost {
  constructor(canvas, board) {
    assertParameters(arguments, Canvas, Board);
    
    this._canvas = canvas;
    this._board = board;
    
    // Bind draw to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
    
    // Add in text input for name
    const nameInputEnv = Lost._getNameInputEnvelope(this._canvas);
    this._input = new CanvasInput({
      canvas: this._canvas.element,
      x: nameInputEnv.topLeft.x,
      y: nameInputEnv.topLeft.y,
      width: nameInputEnv.size.width,
      height: nameInputEnv.size.height,
      placeHolder: 'Name'
    });
    
    const butBackToHomeEnv = Lost._getBackToHomeButtonEnvelope(this._canvas);
    const butSubmitEnv = Lost._getSubmitButtonEnvelope(this._canvas);

    this._butBackToHome = new Button(this._canvas, butBackToHomeEnv,'Home');
    this._butSubmit = new Button(this._canvas, butSubmitEnv,'Submit');
    
    this._butBackToHome.onClick(this._backToHome.bind(this));
    this._butSubmit.onClick(this._submit.bind(this));
  }
  
  static get _BUTTON_SIZE() {
    return new Size(Lost._BUTTON_WIDTH, Lost._BUTTON_HEIGHT);
  }
  
  static _getBackToHomeButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .translate(new Coordinate(-(HighScore._BUTTON_WIDTH + 50), 0))
        .translate(new Coordinate(0, -(HighScore._BUTTON_HEIGHT + 50)));
        
    return new Envelope(topLeft, HighScore._BUTTON_SIZE);
  }
  
  static _getSubmitButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/Lost._HEIGHT_SCALE)
        .translate(new Coordinate(45, 130))
        
    return new Envelope(topLeft, Lost._BUTTON_SIZE);
  }
  
  static _getNameInputEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const size = new Size(Lost._INPUT_WIDTH, Lost._INPUT_HEIGHT);    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/Lost._HEIGHT_SCALE)
        .translate(new Coordinate(-Lost._INPUT_WIDTH, 130));
    
    return new Envelope(topLeft, size);
  }
  
  static _getTitleCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/Lost._HEIGHT_SCALE);
        
    return topLeft;
  }
  
  static _getHSCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = Lost._getTitleCoord(canvas)
        .translate(new Coordinate(0, 90));
        
    return topLeft;
  }
  
  static _getSubmittedCoord(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, canvas.height)).toCoordinate()
        .scale(1/2, 1/Lost._HEIGHT_SCALE)
        .translate(new Coordinate(0, 140));
        
    return topLeft;
  }
  
  // Deactivate all events related to this page.
  remove() {
    this._input.destroy();
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    if (this._butBackToHome) this._butBackToHome.remove();
    if (this._butSubmit) this._butSubmit.remove();
  }
  
  _draw() {
    // Draw title
    this._canvas.drawText(Lost._getTitleCoord(this._canvas), 
        'HEX2048', 'center', '60px Arial');
    
    // Draw your score: #
    this._canvas.drawText(Lost._getHSCoord(this._canvas), 
        ('Your Score: ' + this._board.score), 'center', '40px Arial');
    
    if (!this._submitting && !this._backing) {
      this._input.render();
    } else if (this._submitting) {
      // Shouldn't display the submit button anymore
      this._butSubmit.remove();
      
      this._canvas.drawText(Lost._getSubmittedCoord(this._canvas),
          Lost._SUBMITTED_TEXT, 'center', Lost._SUBMITTED_FONT);
    }
  }
  
  _submit(button) {
    // Prevent this from being activated multiple times
    button.disable();
    
    // Express that data is being submitted
    this._submitting = true;
    
    const data = {
      name: this._input.value(),
      score: this._board.score
    };

    // Make sure an actual name was inputted
    if (data.name === '') return;
    
    HighScore.callLambda('addScore', data).then((res) => {
      if (res.success) {
        HighScore.callLambda('getRank', {score: data.score}).then((res) => {
          if (res.success) {
            console.log(res.rank);
            
            // Go to high scores
            Events.dispatch(Lost.EVENT_TYPES.GOTO_HIGH_SCORE, [data.name, res.rank]);
          }
        });
      }
    }).catch((err) => {
      alert(err.message);
    });
  }
  
  _backToHome(button) {
    // Prevent this from being activated multiple times
    button.disable();
    
    // Express that user is going back to home
    this._backing = true;

    // Go back to home (which will change the state)
    Events.dispatch(Lost.EVENT_TYPES.GOTO_HOME);
  }
}

Lost.EVENT_TYPES = {
  GOTO_HOME: 'lost-goto-home',
  GOTO_HIGH_SCORE: 'lost-goto-high-score'
};

Lost._BUTTON_WIDTH = 100;
Lost._BUTTON_HEIGHT = 38;
Lost._INPUT_WIDTH = 150;
Lost._INPUT_HEIGHT = 25;
Lost._HEIGHT_SCALE = 4;

Lost._SUBMITTED_TEXT = 'Submitting...';
Lost._SUBMITTED_FONT = '28px Arial';