// import 'Canvas'
// import 'Events'

/**
 * Periodically fires a draw event.
 */
class DrawTimer {
  constructor(canvas, fps) {
    this._canvas = canvas;
    this._interval = 1000 / fps;
    this._timer;
  }
    
  start() {
    this._timer = setInterval(this._draw.bind(this), this._interval);
  }
  
  stop() {
    clearInterval(this._timer);
  }
  
  _draw() {
    this._canvas.clear();
    
    Events.dispatch(DrawTimer.EVENT_TYPES.DRAW);
  }
};

DrawTimer.EVENT_TYPES = {
  DRAW: 'drawtimer-draw'
};
