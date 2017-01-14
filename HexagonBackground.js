// import 'Hexagon'

/**
 * Represents a hexagon for the background.
 */
class HexagonBackground extends Hexagon {
  constructor(canvas, center, radius) {
    super(canvas, center, radius);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, 0);
  }
  
  _draw() {
    const coords = this._getCoords();
    this._canvas.drawPolygon(coords, HexagonBackground.BACKGROUND_COLOR);
  }
};

HexagonBackground.BACKGROUND_COLOR = '#bbada0';
