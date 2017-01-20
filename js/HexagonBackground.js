// import 'Hexagon'

/**
 * Represents a hexagon for the background.
 */
class HexagonBackground extends Hexagon {
  constructor(canvas, center, radius) {
    assertParameters(arguments, Canvas, Coordinate, Number);
    
    super(canvas, center, radius);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, 0);
  }
  
  disableDrawing() {
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
  
  _draw() {
    assertParameters(arguments);
    
    const coords = this._getCoords();
    this._canvas.drawPolygon(coords, HexagonBackground.BACKGROUND_COLOR);
  }
};

HexagonBackground.BACKGROUND_COLOR = '#bbada0';
