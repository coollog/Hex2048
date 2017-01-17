// import 'Easing'
// import 'Hexagon'

/**
 * Represents an animated hexagon.
 */
class HexagonAnimated extends Hexagon {
  constructor(canvas, radius, centerStart, centerEnd, zIndex) {
    assertParameters(arguments, Canvas, Number, Coordinate, Coordinate, Number);
    
    super(canvas, centerStart, radius);
    
    this._centerStart = centerStart;
    this._centerEnd = centerEnd;
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, zIndex);
  }
  
  // Interpolates between _centerStart and _centerEnd by scale (0 to 1).
  animate(scale) {
    assertParameters(arguments, Number);
    
    scale = Easing.CubicOut(scale);
    const diff = this._centerEnd.subtract(this._centerStart);
    this._center = this._centerStart.translate(diff.scale(scale));
  }
  
  delete() {
    assertParameters(arguments);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
};
