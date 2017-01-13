// import 'Coordinate'

/**
 * Works with the HTML Canvas DOM element.
 */
class Canvas {
  // 'canvasId' is the HTML DOM element id of the canvas.
  constructor(canvasId) {
    this._canvas = document.getElementById(canvasId);
    this._context = this._canvas.getContext('2d');
  }
  
  // Alias for DOM addEventListener.
  listen() {
    this._canvas.addEventListener(...arguments);
  }
  
  // Clears the context.
  clear() {
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  
  // Draw line from 'startCoord' to 'endCoord'.
  drawLine(startCoord, endCoord) {
    this._context.beginPath();
    this._context.moveTo(...startCoord.toArray());
    this._context.lineTo(...endCoord.toArray());
    this._context.stroke();
  }
  
  // Draw polygon shape (will apply color and stroke)
  drawPolygon(coords, color) {
    this._context.beginPath();
    this._context.moveTo(...coords[0].toArray());
    for (let i = 1; i < coords.length; i++) {
      this._context.lineTo(...coords[i].toArray());
    }
    this._context.lineTo(...coords[0].toArray()); // To close the shape
    this._context.closePath();
    this._context.fillStyle = color;
    this._context.fill();
    this._context.stroke();
  }
  
  // Draw text centered at coord
  drawText(coord, text, textAlign, font) {
    this._context.font = font;
    this._context.fillStyle = 'black';
    this._context.textAlign = textAlign;
    this._context.textBaseline = 'middle';
    this._context.fillText(text, ...coord.toArray());
  }
  
  // Draw 'img' at 'destCoord', rotated by 'angle', scaled by 'scaleX' and
  // 'scaleY', with origin at 'originCoord'.
  drawImage(img, destCoord, originCoord, angle, scaleX, scaleY) {
    this._context.save();
    this._context.translate(...destCoord.toArray());
    this._context.scale(scaleX, scaleY);
    this._context.rotate(angle);
    this._context.translate(...originCoord.toArray());
    this._context.drawImage(img, 0, 0);
    this._context.restore();
  }
  
  drawWithOpacity(opacity, drawFn) {
    this._context.globalAlpha = opacity;
    drawFn();
    this._context.globalAlpha = 1.0;
  }
  
  getMousePosition(e) {
    const canvasRect = this._canvas.getBoundingClientRect();
    const x =
        (e.clientX - canvasRect.left) / canvasRect.width *
        this._canvas.width;
    const y =
        (e.clientY - canvasRect.top) / canvasRect.height *
        this._canvas.height;
    return new Coordinate(x, y);
  }
}