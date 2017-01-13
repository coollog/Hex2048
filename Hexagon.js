// import 'Coordinate'

class Hexagon {
  // Create a hexagon centered at center and with radius (center to vertex) radius
  constructor(canvas, center, radius) {
    this._canvas = canvas;
    this._center = center;
    this._radius = radius;
    this._text = '';
    this._color;
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

      // this._canvas.drawLine(startCoord, endCoord);
      coords.push(startCoord);
    }
    this._canvas.drawPolygon(coords, this._color);
  }
  
  // Get the text of the hexagon
  get text() {
    return this._text;
  }
  
  // Set the text of the hexagon to be text
  set text(text) {
    this._text = text;
    if (text == '' || isNaN(text)) {
      this._color = COLORS[0];
    } else {
      let num = Math.log2(text);
      if (num % 1 === 0) {
        num = Math.min(num, COLORS.length - 1);
        this._color = COLORS[num];
      } else {
        this._color = COLORS[0];
      } 
    }
  }
  
  // Draw the text
  drawText() {
    this._canvas.drawText(this._center, this._text);
  }
}

const COLORS = ['white', '#F0E4D8', '#EEE0C6', '#EFAF79', '#E58D53', '#EB573D', 
    '#E7554A', '#ECC962', '#EBC94C', '#EEC341', '#ECC22E', '#59E093']