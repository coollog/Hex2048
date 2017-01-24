// import 'Hexagon'

/**
 * Represents a hexagon for the background.
 */
class HexagonBackground extends Hexagon {
  constructor(canvas, center, radius) {
    assertParameters(arguments, Canvas, Coordinate, Number);
    
    super(canvas, center, radius);
    
    this._opacity = 1.0;
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this, 0);
  }
  
  disableDrawing() {
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
  
  set opacity(opacity) {
    assertParameters(arguments, Number);
    
    this._opacity = opacity;
  }
  
  _draw() {
    assertParameters(arguments);
    
    const coords = this._getCoords();
    
    function drawHex() {
      this._canvas.drawPolygon(coords, HexagonBackground.BACKGROUND_COLOR);
    }
    
    this._canvas.drawWithOpacity(this._opacity, drawHex.bind(this));
  }
};

HexagonBackground.BACKGROUND_COLOR = '#bbada0';
