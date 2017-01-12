// import 'Coordinate'

class Hexagon {
  // Create a hexagon centered at center and with radius (center to vertex) radius
  constructor(canvas, center, radius) {
    this._canvas = canvas;
    this._center = center;
    this._radius = radius;
    this.text = ""
  }

  // Draw the actual hexagon shape
  drawShape() {
    for (let i = 0; i < 6; i ++) {
      const startAngle = i * Math.PI / 3;
      const endAngle = (i + 1) * Math.PI / 3;

      const startCoord = new Coordinate(
          this._center.x + Math.cos(startAngle) * this._radius,
          this._center.y + Math.sin(startAngle) * this._radius);
      const endCoord = new Coordinate(
          this._center.x + Math.cos(endAngle) * this._radius,
          this._center.y + Math.sin(endAngle) * this._radius);

      this._canvas.drawLine(startCoord, endCoord)
    }
  }
  
  // Set the text of the hexagon to be text
  setText(text) {
    this.text = text;
  }
  
  // Draw the text
  drawText() {
    this._canvas.drawText(this._center, this.text);
  }
}