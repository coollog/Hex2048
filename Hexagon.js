// import 'Coordinate'
// import 'Easing'

class Hexagon {
  // Create a hexagon centered at center and with radius (center to vertex) radius
  constructor(canvas, center, radius) {
    this._canvas = canvas;
    this._center = center;
    this._radius = radius;
    this._text = '';
    this._color;
    
    this._blinking = false;
    
    this._shouldDraw = true;
    
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  startBlink() {
    this._blinking = 0;
  }
  endBlink() {
    this._blinking = false;
  }
  
  enableDrawing() {
    this._shouldDraw = true;
  }
  disableDrawing() {
    this._shouldDraw = false;
  }
  
  // Get the text of the hexagon
  get text() {
    return this._text;
  }
  
  // Set the text of the hexagon to be text
  set text(text) {
    this._text = text;
    
    if (!(text in Hexagon.NUMBER_PROPS)) {
      text = 'default';
    }
    
    const {color, highlight} = Hexagon.NUMBER_PROPS[text];
    this._color = color;
    this._highlight = highlight;
  }

  // Draw the actual hexagon shape
  _drawShape() {
    this._updateBlinking();
    
    const radius = this._calculateRadius();
    const coords = this._getCoords(radius);
    
    if (this._highlight !== false && this._shouldDraw) {
      const highlightSize = this._highlight * (Hexagon.HIGHLIGHT_SIZE + radius);
      this._canvas.drawWithShadow(highlightSize, Hexagon.HIGHLIGHT_COLOR, 
          this._drawWithCoords.bind(this, coords));
    } else {
      this._drawWithCoords(coords);
    }
  }
  
  _calculateRadius() {
    let radius = this._radius;
    
    if (this._blinking) {
      const blinkHalf = Hexagon.BLINK_MAX / 2;
      const blinkScale = 1 - Math.abs(blinkHalf - this._blinking) / blinkHalf;
      const blinkSize = Hexagon.BLINK_SIZE * Easing.CubicInOut(blinkScale);
      radius += blinkSize;
    }
    
    return radius;
  }
  
  _getCoords(radius = this._calculateRadius()) {
    const coords = [];
    
    for (let i = 0; i < 6; i ++) {
      const startAngle = i * Math.PI / 3;
      const endAngle = (i + 1) * Math.PI / 3;

      const startCoord = new Coordinate(
          this._center.x + Math.cos(startAngle) * radius,
          this._center.y + Math.sin(startAngle) * radius);
      const endCoord = new Coordinate(
          this._center.x + Math.cos(endAngle) * radius,
          this._center.y + Math.sin(endAngle) * radius);

      coords.push(startCoord);
    }
    
    return coords;
  }
  
  // Draw the text
  _drawText() {
    if (!this._shouldDraw) return;
    
    this._canvas.drawText(this._center, this._text, 'center', '26px Arial');
  }

  _draw() {
    this._drawShape();
    this._drawText();
  }
  
  _drawWithCoords(coords) {
    const color = this._shouldDraw ? this._color : 'white';
    
    this._canvas.drawPolygon(coords, color);
  }
  
  _updateBlinking() {
    if (this._blinking !== false) {
      this._blinking ++;
      if (this._blinking === Hexagon.BLINK_MAX) {
        this.endBlink();
      }
    }
  }
}

Hexagon.SPACING = 10;

Hexagon.BLINK_MAX = 15;
Hexagon.BLINK_SIZE = 10;

Hexagon.HIGHLIGHT_COLOR = 'yellow';
Hexagon.HIGHLIGHT_SIZE = 20;

Hexagon.NUMBER_PROPS = {
  '': { color: 'white', highlight: false }, 
  2: { color: '#F0E4D8', highlight: false },
  4: { color: '#EEE0C6', highlight: false },
  8: { color: '#EFAF79', highlight: false },
  16: { color: '#E58D53', highlight: false },
  32: { color: '#EB573D', highlight: false },
  64: { color: '#E7554A', highlight: false },
  128: { color: '#ECC962', highlight: false },
  256: { color: '#EBC94C', highlight: false },
  512: { color: '#EEC341', highlight: 0.25 },
  1024: { color: '#ECC22E', highlight: 0.5 },
  2048: { color: '#edc22e', highlight: 0.75 },
  4096: { color: '#59E093', highlight: 1 },
  default: { color: '#59E093', highlight: 1 },
};
