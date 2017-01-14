// import 'Canvas'
// import 'Coordinate'
// import 'Events'

class InputHandler {
  constructor(canvas) {
    this._canvas = canvas;
    this._dragging = false;
    
    // Attach the event listeners.
    canvas.listen('mousedown', this._dragStart.bind(this));
    canvas.listen('mousemove', this._drag.bind(this));
    canvas.listen('mouseup', this._dragEnd.bind(this));
    canvas.listen('keydown', this._key.bind(this));
    canvas.listen('click', this._click.bind(this));
  }
  
  _dragStart(e) {
    this._dragging = true;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG_START);
  }
  _drag(e) {
    if (!this._dragging) return;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG);
  }
  _dragEnd(e) {
    if (!this._dragging) return;
    this._dragging = false;
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.DRAG_END);
  }
  
  _key(e) {
    const keyChar = String.fromCharCode(e.keyCode);
    Events.dispatch(InputHandler.EVENT_TYPES.KEY, keyChar);
  }
  
  _click(e) {
    this._dispatchMouseEvent(e, InputHandler.EVENT_TYPES.CLICK);
  }

  _dispatchMouseEvent(e, eventType) {
    const mousePosition = this._canvas.getMousePosition(e);
    Events.dispatch(eventType, mousePosition);
  }
}

InputHandler.EVENT_TYPES = {
  DRAG_START: 'input-dragstart',
  DRAG: 'input-drag',
  DRAG_END: 'input-dragend',
  KEY: 'input-key',
  CLICK: 'input-click'
};
