// import 'Coordinate'

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

  // Draw the actual hexagon shape
  drawShape() {
    let coords = [];
    
    for (let i = 0; i < 6; i ++) {
      const startAngle = i * Math.PI / 3;
      const endAngle = (i + 1) * Math.PI / 3;

      const startCoord = new Coordinate(
          this._center.x + Math.cos(startAngle) * this._radius,
          this._center.y + Math.sin(startAngle) * this._radius);
      const endCoord = new Coordinate(
          this._center.x + Math.cos(endAngle) * this._radius,
          this._center.y + Math.sin(endAngle) * this._radius);

      coords.push(startCoord);
    }
    
    this._updateBlinking();
    if (this._blinking) {
      const blinkHalf = Hexagon.BLINK_MAX / 2;
      const blinkScale = 1 - Math.abs(blinkHalf - this._blinking) / blinkHalf;
      const blinkSize = Hexagon.BLINK_SHADOW_SIZE * blinkScale;
      this._canvas.drawWithShadow(
          blinkSize, Hexagon.BLINK_SHADOW_COLOR, 
          this._drawWithCoords.bind(this, coords));
    }
    else if (this._highlight !== false) {
      this._canvas.drawWithShadow(
          this._highlight * Hexagon.HIGHLIGHT_SIZE, Hexagon.HIGHLIGHT_COLOR, 
          this._drawWithCoords.bind(this, coords));
    } else {
      this._drawWithCoords(coords);
    }
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
  
  // Draw the text
  drawText() {
    if (!this._shouldDraw) return;
    
    this._canvas.drawText(this._center, this._text, 'center', '30px Arial');
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

Hexagon.BLINK_MAX = 30;
Hexagon.BLINK_SHADOW_COLOR = 'yellow';
Hexagon.BLINK_SHADOW_SIZE = 50;

Hexagon.HIGHLIGHT_COLOR = 'yellow';
Hexagon.HIGHLIGHT_SIZE = 40;

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
  2048: { color: '#59E093', highlight: 0.75 },
  4096: { color: '#59E093', highlight: 1 },
  default: { color: '#59E093', highlight: 1 },
};
