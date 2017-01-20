// import 'Controller'
// import 'DrawTimer'
// import 'Events'
// import 'InputHandler'

/**
 * Handles the directional gesture.
 */
class GestureHandler {
  constructor(canvas) {
    assertParameters(arguments, Canvas);
    
    this._canvas = canvas;
    this._drawOn = false;
    this._dragging = false;
    
    // Attach event listeners.
    Events.on(InputHandler.EVENT_TYPES.DRAG_START, this._dragStart, this);
    Events.on(InputHandler.EVENT_TYPES.DRAG, this._drag, this);
    Events.on(InputHandler.EVENT_TYPES.DRAG_END, this._dragEnd, this);
    
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, 100);
    
    Events.on(GestureHandler.EVENT_TYPES.ON, this._on, this);
    Events.on(GestureHandler.EVENT_TYPES.OFF, this._off, this);
  }
  
  _on() {
    assertParameters(arguments);
    
    this._drawOn = true;
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, 100);
  }
  
  _off() {
    assertParameters(arguments);
    
    this._drawOn = false
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
  
  _draw(imgRightArrow = ASSETS.RIGHT_ARROW) {
    assertParameters(arguments, [HTMLImageElement, undefined]);
    
    const ARROW_MAX_SCALE = 0.2;
    
    this._canvas.drawWithOpacity(0.5, () => {
      if (this._dragging) {
        this._canvas.drawLine(this._dragStartCoord, this._dragCurrentCoord);
        
        if (this._hasGesture()) {
          const originCoord = new Coordinate(0, -imgRightArrow.height / 2);
          const angle = -this._gesture * Math.PI / 3 - Math.PI / 6;
          const scale = Math.min(
              ARROW_MAX_SCALE, this._dragDistance() / imgRightArrow.width);
          this._canvas.drawImage(
              imgRightArrow, this._dragStartCoord, originCoord, angle, scale, 
              scale);
        }
      }
    });
  }
  
  _dragStart(mousePosition) {
    assertParameters(arguments, Coordinate);
    
    this._dragging = true;
    this._dragStartCoord = mousePosition;
    this._dragCurrentCoord = mousePosition;
  }
  _drag(mousePosition) {
    assertParameters(arguments, Coordinate);
    
    this._dragCurrentCoord = mousePosition;
    this._updateGesture();
  }
  _dragEnd(mousePosition) {
    assertParameters(arguments, Coordinate);
    
    this._dragging = false;
    this._dragCurrentCoord = mousePosition;
    if (this._updateGesture()) {
      Events.dispatch(Controller.EVENT_TYPES.INPUT_DIRECTION, 
          new InputDirection(this._gesture));
    }
  }
  
  // Return the distance dragged.
  _dragDistance() {
    assertParameters(arguments);
    
    return this._dragStartCoord.distanceTo(this._dragCurrentCoord);
  }
  
  // Return the angle of dragging.
  _dragAngle() {
    assertParameters(arguments);
    
    return this._dragStartCoord.angleTo(this._dragCurrentCoord);
  }
  
  // Return true if the dragging is long enough.
  _hasGesture() {
    assertParameters(arguments);
    
    return this._dragDistance() >= GestureHandler._DRAG_THRESHOLD;
  }
  
  // Updates the gesture index.
  _updateGesture() {
    assertParameters(arguments);
    
    // Don't do anything if didn't drag far enough.
    if (!this._hasGesture()) return false;
    
    // Get the closest angle.
    const normalizedAngle = this._dragAngle() % (2 * Math.PI);
    const angleIndex = Math.floor(normalizedAngle / (Math.PI / 3));
    
    this._gesture = angleIndex;
    
    return true;
  }
}

GestureHandler.EVENT_TYPES = {
  ON: 'gesture-handler-on',
  OFF: 'gesture-handler-off'
};

GestureHandler._DRAG_THRESHOLD = 20;
