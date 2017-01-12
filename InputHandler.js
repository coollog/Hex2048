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
  }
  
  _dragStart(e) {
    this._dragging = true;
    this._dispatchDragEvent(e, InputHandler.EVENT_TYPES.DRAG_START);
  }
  _drag(e) {
    if (!this._dragging) return;
    this._dispatchDragEvent(e, InputHandler.EVENT_TYPES.DRAG);
  }
  _dragEnd(e) {
    if (!this._dragging) return;
    this._dragging = false;
    this._dispatchDragEvent(e, InputHandler.EVENT_TYPES.DRAG_END);
  }

  _dispatchDragEvent(e, eventType) {
    const mousePosition = this._canvas.getMousePosition(e);
    Events.dispatch(eventType, mousePosition);
  }
}

InputHandler.EVENT_TYPES = {
  DRAG_START: 'input-dragstart',
  DRAG: 'input-drag',
  DRAG_END: 'input-dragend'
};
