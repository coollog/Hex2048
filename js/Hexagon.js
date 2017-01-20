// import 'Coordinate'
// import 'Easing'

class Hexagon {
  // Create a hexagon centered at center and with radius (center to vertex) radius
  constructor(canvas, center, radius) {
    assertParameters(arguments, Canvas, Coordinate, Number);
    
    this._canvas = canvas;
    this._center = center;
    this._radius = radius;
    this._text = '';
    this._color;
    
    this._shouldDraw = true;
    
    this._blinking = false;
  
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
  }
  
  startBlink() {
    assertParameters(arguments);
    
    this._blinking = 0;
  }
  endBlink() {
    assertParameters(arguments);
    
    this._blinking = false;
  }
  
  enableDrawing() {
    assertParameters(arguments);
    
    this._shouldDraw = true;
  }
  disableDrawing() {
    assertParameters(arguments);
    
    this._shouldDraw = false;
  }
  
  remove() {
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }
  
  // Get the text of the hexagon
  get text() {
    return this._text;
  }
  
  // Set the text of the hexagon to be text
  set text(text) {
    assertParameters(arguments, [Number, String]);
    
    this._text = text;
    
    if (!(text in Hexagon.NUMBER_PROPS)) {
      text = 'default';
    }
    
    const {color, textColor, highlight} = Hexagon.NUMBER_PROPS[text];
    this._color = color;
    this._highlight = highlight;
    this._textColor = textColor;
  }

  // Draw the actual hexagon shape
  _drawShape() {
    assertParameters(arguments);
    
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
    assertParameters(arguments);
    
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
    assertParameters(arguments, [Number, undefined]);
    
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
    assertParameters(arguments);
    
    if (!this._shouldDraw) return;
    
    this._canvas.drawText(
        this._center, this._text.toString(), 'center', Hexagon.FONT, this._textColor);
  }

  _draw() {
    assertParameters(arguments);
    
    this._drawShape();
    this._drawText();
  }
  
  _drawWithCoords(coords) {
    assertParameters(arguments, Array);
    
    const color = this._shouldDraw ? this._color : 'white';
    
    this._canvas.drawPolygon(coords, color);
  }
  
  _updateBlinking() {
    assertParameters(arguments);
    
    if (this._blinking !== false) {
      this._blinking ++;
      if (this._blinking === Hexagon.BLINK_MAX) {
        this.endBlink();
      }
    }
  }
}

Hexagon.SPACING = 10;

Hexagon.FONT = 'bold 26px "Clear Sans", "Helvetica Neue", Arial, sans-serif';

Hexagon.BLINK_MAX = 15;
Hexagon.BLINK_SIZE = 10;

Hexagon.HIGHLIGHT_COLOR = 'yellow';
Hexagon.HIGHLIGHT_SIZE = 20;

Hexagon.NUMBER_PROPS = {
  '': { color: 'white', textColor: 'black', highlight: false }, 
  2: { color: '#F0E4D8', textColor: '#776e65', highlight: false },
  4: { color: '#EEE0C6', textColor: '#776e65', highlight: false },
  8: { color: '#EFAF79', textColor: 'white', highlight: false },
  16: { color: '#E58D53', textColor: 'white', highlight: false },
  32: { color: '#F97B5B', textColor: 'white', highlight: false },
  64: { color: '#FF3C42', textColor: 'white', highlight: false },
  128: { color: '#ECC962', textColor: 'white', highlight: false },
  256: { color: '#EBC94C', textColor: 'white', highlight: false },
  512: { color: '#EEC341', textColor: 'white', highlight: 0.25 },
  1024: { color: '#ECC22E', textColor: 'white', highlight: 0.5 },
  2048: { color: '#edc22e', textColor: 'white', highlight: 0.75 },
  4096: { color: '#59E093', textColor: 'white', highlight: 1 },
  default: { color: '#59E093', textColor: 'white', highlight: 1 },
};
