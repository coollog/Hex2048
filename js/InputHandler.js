// import 'Canvas'
// import 'Coordinate'
// import 'Events'

class InputHandler {
  constructor(canvas) {
    assertParameters(arguments, Canvas);
    
    this._canvas = canvas;
    this._dragging = false;
    this._touching = false;
    
    // Attach the event listeners.
    canvas.listen('mousedown', this._dragStart.bind(this));
    canvas.listen('mousemove', this._drag.bind(this));
    canvas.listen('mouseup', this._dragEnd.bind(this));
    canvas.listen('keydown', this._key.bind(this));
    canvas.listen('click', this._click.bind(this));
    canvas.listen('mousemove', this._hover.bind(this));
    canvas.listen('touchstart', this._touchStart.bind(this));
    canvas.listen('touchmove', this._touch.bind(this));
    canvas.listen('touchend', this._touchEnd.bind(this));
  }
  
  _dragStart(e) {
    assertParameters(arguments, MouseEvent);
    
    this._dragging = true;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG_START);
  }
  _drag(e) {
    assertParameters(arguments, MouseEvent);
    
    if (!this._dragging) return;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG);
  }
  _dragEnd(e) {
    assertParameters(arguments, MouseEvent);
    
    if (!this._dragging) return;
    this._dragging = false;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG_END);
  }
  
  _key(e) {
    assertParameters(arguments, KeyboardEvent);
    
    const keyChar = String.fromCharCode(e.keyCode);
    Events.dispatch(InputHandler.EVENT_TYPES.KEY, keyChar);
  }
  
  _click(e) {
    assertParameters(arguments, MouseEvent);
    
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.CLICK);
  }
  
  _hover(e) {
    assertParameters(arguments, MouseEvent);
    
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.HOVER);
  }

  _touchStart(e) {
    assertParameters(arguments, TouchEvent);

    this._touching = true;
    this._dispatchTouchEvent(e, InputHandler.EVENT_TYPES.TOUCH_START);
  }
  _touch(e) {
    assertParameters(arguments, TouchEvent);

    if (!this._touching) return;
    this._dispatchTouchEvent(e, InputHandler.EVENT_TYPES.TOUCH);
  }
  _touchEnd(e) {
    assertParameters(arguments, TouchEvent);

    if (!this._touching) return;
    this._touching = false;
    this._dispatchTouchEvent(e, InputHandler.EVENT_TYPES.TOUCH_END);
  }

  _dispatchMouseEvent(e, eventType) {
    assertParameters(arguments, MouseEvent, InputHandler.EVENT_TYPES);
    
    const canvasPosition = this._canvas.scaleScreenPosition(e.clientX, e.clientY);
    Events.dispatch(eventType, canvasPosition);
  }

  _dispatchTouchEvent(e, eventType) {
    assertParameters(arguments, TouchEvent, InputHandler.EVENT_TYPES);

    const clientX = e.changedTouches[0].pageX;
    const clientY = e.changedTouches[0].pageY;
    const canvasPosition = this._canvas.scaleScreenPosition(clientX, clientY);
    Events.dispatch(eventType, canvasPosition);
    e.preventDefault();
  }
}

InputHandler.EVENT_TYPES = {
  DRAG_START: 'input-dragstart',
  DRAG: 'input-drag',
  DRAG_END: 'input-dragend',
  KEY: 'input-key',
  CLICK: 'input-click',
  HOVER: 'input-hover',
  TOUCH_START: 'input-touchstart',
  TOUCH: 'input-touch',
  TOUCH_END: 'input-touchend'
};
