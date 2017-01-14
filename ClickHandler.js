// import 'Controller'
// import 'Events'
// import 'InputHandler'

/**
 * Handles the directional gesture.
 */
class ClickHandler {
  constructor(canvas) {
    this._canvas = canvas;
    this._areas = {};

    Events.on(InputHandler.EVENT_TYPES.CLICK, this._click, this);
  }

  // area = {coord: topLeftCoord, width: width, height: height}
  // eventName is a unique string that will be used to call the event
  registerArea(area, eventName) {
    this._areas[eventName] = area;
  }

  _click(mousePosition) {
    for (let event in this._areas) {
      if (!this._areas.hasOwnProperty(event)) continue;
      
      let area = this._areas[event];
      if (this._isInArea(mousePosition, area)) {
        Events.dispatch(event);
      }
    }
  }
  
  _isInArea(mousePos, area) {
    const xIn = mousePos.x > area.coord.x && (mousePos.x < area.coord.x + area.width);
    const yIn = mousePos.y > area.coord.y && (mousePos.y < area.coord.y + area.height);
    
    return xIn && yIn;
  }
}