// import 'Events'
// import 'InputHandler',
// import 'Coordinate'
// import 'Canvas'

class Button {
	constructor(canvas, coord, width, height, text, handler) {
    this._canvas = canvas
		this._coord = coord;
    this._width = width;
    this._height = height;
    this._text = text;
    this._name = name;
    this._handler = handler;

    // Is this button active (aka can it be clicked)
    this._active = true;
    Events.on(InputHandler.EVENT_TYPES.CLICK, this._clicked, this);
	}

  get active() {
    return this._active;
  }
  set active(active) {
    this._active = active;
  }

  _draw() {
    if (!this._active) return;

    this._canvas.drawButton2(butStartArea, this._text);
  }

  _clicked(mousePos) {
    if (!this._active) return;

    const xIn = mousePos.x > this._coord.x && (mousePos.x < this._coord.x + this._width);
    const yIn = mousePos.y > this._coord.y && (mousePos.y < this._coord.y + this._height);
    
    // Did not click in the button
    if (!(xIn && yIn)) return;

    // Run the handler
    this._handler();
  }
}