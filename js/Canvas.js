// import 'Coordinate'

/**
 * Works with the HTML Canvas DOM element.
 */
class Canvas {
  // 'canvasId' is the HTML DOM element id of the canvas.
  constructor(canvasId) {
    assertParameters(arguments, String);
    
    this._canvas = document.getElementById(canvasId);
    this._context = this._canvas.getContext('2d');
  }
  
  get width() {
    return this._canvas.width;
  }
  get height() {
    return this._canvas.height;
  }
  
  get element() {
    return this._canvas;
  }
  
  // Alias for DOM addEventListener.
  listen() {
    assertParameters(arguments, undefined);
    this._canvas.addEventListener(...arguments);
  }
  
  // Clears the context.
  clear() {
    assertParameters(arguments);
    
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  }
  
  // Draw line from 'startCoord' to 'endCoord'.
  drawLine(startCoord, endCoord) {
    assertParameters(arguments, Coordinate, Coordinate);
    
    this._context.beginPath();
    this._context.moveTo(...startCoord.toArray());
    this._context.lineTo(...endCoord.toArray());
    this._context.stroke();
  }
  
  // Draw a stroke rectangle with coord = top left corner.
  drawRectangle(type, envelope, color = undefined) {
    assertParameters(arguments, Number, Envelope, [String, undefined]);
    
    switch (type) {
      case Canvas.RECTANGLE_TYPE.STROKE:
        this._context.strokeRect(
            ...envelope.topLeft.toArray(), ...envelope.size.toArray());
        break;
      case Canvas.RECTANGLE_TYPE.FILL:
        if (color) this._context.fillStyle = color;
        this._context.fillRect(
            ...envelope.topLeft.toArray(), ...envelope.size.toArray());
        break;
      default:
        return;
    }
  }
  
  // Draw polygon shape (will apply color and stroke).
  drawPolygon(coords, color) {
    assertParameters(arguments, Array, String);
    
    this._context.beginPath();
    this._context.moveTo(...coords[0].toArray());
    for (let coord of coords) {
      this._context.lineTo(...coord.toArray());
    }
    this._context.lineTo(...coords[0].toArray()); // To close the shape.
    this._context.closePath();
    this._context.fillStyle = color;
    this._context.fill();
  }
  
  // Draw text centered at coord.
  drawText(coord, text, textAlign, font, color = 'black') {
    assertParameters(
        arguments, Coordinate, String, String, String, [String, undefined]);
    
    this._context.font = font;
    this._context.fillStyle = color;
    this._context.textAlign = textAlign;
    this._context.textBaseline = 'middle';
    this._context.fillText(text, ...coord.toArray());
  }
  
  // Draw 'img' at 'destCoord', rotated by 'angle', scaled by 'scaleX' and
  // 'scaleY', with origin at 'originCoord'.
  drawImage(img, destCoord, originCoord, angle, scaleX, scaleY) {
    assertParameters(arguments, HTMLImageElement, Coordinate, Coordinate, 
        Number, Number, Number);
        
    this._context.save();
    this._context.translate(...destCoord.toArray());
    this._context.scale(scaleX, scaleY);
    this._context.rotate(angle);
    this._context.translate(...originCoord.toArray());
    this._context.drawImage(img, 0, 0);
    this._context.restore();
  }
  
  drawWithOpacity(opacity, drawFn) {
    assertParameters(arguments, Number, Function);
    
    this._context.globalAlpha = opacity;
    drawFn();
    this._context.globalAlpha = 1.0;
  }
  
  drawWithShadow(size, color, drawFn) {
    assertParameters(arguments, Number, String, Function);
    
    this._context.save();
    this._context.shadowBlur = size;
    this._context.shadowColor = color;
    drawFn();
    this._context.restore();
  }
  
  getMousePosition(e) {
    assertParameters(arguments, MouseEvent);
    
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

Canvas.RECTANGLE_TYPE = {
  STROKE: 0,
  FILL: 1
};