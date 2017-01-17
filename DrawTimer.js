// import 'Canvas'
// import 'Events'

/**
 * Periodically fires a draw event.
 */
class DrawTimer {
  constructor(canvas, fps) {
    assertParameters(arguments, Canvas, Number);
    
    this._canvas = canvas;
    this._interval = 1000 / fps;
    this._timer;
    
    Events.on(DrawTimer.EVENT_TYPES.START, this.start, this);
    Events.on(DrawTimer.EVENT_TYPES.STOP, this.stop, this);
  }
    
  start() {
    assertParameters(arguments);
    
    this._timer = setInterval(this._draw.bind(this), this._interval);
  }
  
  stop() {
    assertParameters(arguments);
    
    clearInterval(this._timer);
  }
  
  _draw() {
    assertParameters(arguments);
    
    this._canvas.clear();
    
    Events.dispatch(DrawTimer.EVENT_TYPES.DRAW);
  }
};

DrawTimer.EVENT_TYPES = {
  DRAW: 'drawtimer-draw',
  START: 'drawtimer-start',
  STOP: 'drawtimer-stop'
};
