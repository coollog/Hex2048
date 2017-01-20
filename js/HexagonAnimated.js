// import 'Easing'
// import 'Hexagon'
// import 'Transition'

/**
 * Represents an animated hexagon.
 */
class HexagonAnimated extends Hexagon {
  constructor(canvas, radius, centerStart, centerEnd, zIndex) {
    assertParameters(arguments, Canvas, Number, Coordinate, Coordinate, Number);
    
    super(canvas, centerStart, radius);
    
    this._centerTransition = new Transition(
        centerStart, centerEnd, 1, Easing.CubicOut, Coordinate.interpolate);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, zIndex);
  }
  
  // Interpolates between _centerStart and _centerEnd by scale (0 to 1).
  animate(scale) {
    assertParameters(arguments, Number);
    
    this._centerTransition.scale(scale);
    this._center = this._centerTransition.value;
  }
  
  delete() {
    assertParameters(arguments);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
};
