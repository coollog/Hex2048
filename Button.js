// import 'Events'
// import 'InputHandler',
// import 'Envelope'
// import 'Canvas'

class Button {
	constructor(canvas, envelope, text) {
	  assertParameters(arguments, Canvas, Envelope, String);
	  
    this._canvas = canvas
		this._envelope = envelope;
    this._text = text;
    
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
    this.enable();
	}

  enable() {
    Events.on(InputHandler.EVENT_TYPES.CLICK, this._clicked, this);
  }
  disable() {
    Events.off(InputHandler.EVENT_TYPES.CLICK, this);
  }

  remove() {
    assertParameters(arguments);
    
    this.disable();
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
  }

  onClick(callBackFunc) {
    assertParameters(arguments, Function);
    
    this._callBackFunc = callBackFunc;
  }
  
  _draw() {
    assertParameters(arguments);
        
    this._canvas.drawRectangle(this._envelope);
    this._canvas.drawText(this._envelope.center, this._text, 'center', '20px Arial');
  }

  _clicked(mousePos) {
    assertParameters(arguments, Coordinate);
    
    // Did not click in the button
    if (!this._envelope.contains(mousePos)) return;

    // Run the handler
    this._callBackFunc(this);
  }
}