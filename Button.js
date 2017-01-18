// import 'Events'
// import 'InputHandler',
// import 'Envelope'
// import 'Canvas'
// import 'Transition'

class Button {
	constructor(canvas, envelope, text) {
	  assertParameters(arguments, Canvas, Envelope, String);
	  
    this._canvas = canvas
		this._envelope = envelope;
    this._text = text;
    
    this._hover = false;
    this._strokeOpacity = new Transition(1, 1, 0, Easing.CubicOut);
    
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._draw, this);
    this.enable();
	}

  enable() {
    assertParameters(arguments);
    
    Events.on(InputHandler.EVENT_TYPES.CLICK, this._clicked, this);
    Events.on(InputHandler.EVENT_TYPES.HOVER, this._hovered, this);
  }
  disable() {
    assertParameters(arguments);
    
    Events.off(InputHandler.EVENT_TYPES.CLICK, this);
    Events.off(InputHandler.EVENT_TYPES.HOVER, this);
    
    if (this._hover) {
      this._canvas.element.style.cursor = Button.CURSOR_OFF;
    }
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
        
    this._strokeOpacity.update();
    this._canvas.drawWithOpacity(this._strokeOpacity.value, 
        this._canvas.drawRectangle.bind(this._canvas, this._envelope));
    this._canvas.drawText(this._envelope.center, this._text, 'center', '20px Arial');
  }

  _clicked(mousePos) {
    assertParameters(arguments, Coordinate);
    
    // Did not click in the button
    if (!this._envelope.contains(mousePos)) return;

    // Run the handler
    this._callBackFunc(this);
  }
  
  _hovered(mousePos) {
    assertParameters(arguments, Coordinate);
    
    const newHover = this._envelope.contains(mousePos);
    if (newHover) {
      if (!this._hover) {
        this._canvas.element.style.cursor = Button.CURSOR_ON;
        this._strokeOpacity.changeTarget(
            Button.HOVER_OPACITY, Button.HOVER_TRANSITION_STEPS);
      }
    } else if (this._hover) {
      this._canvas.element.style.cursor = Button.CURSOR_OFF;
      this._strokeOpacity.changeTarget(1, 20);
    }
    this._hover = newHover;
  }
};

Button.CURSOR_OFF = 'default';
Button.CURSOR_ON = 'pointer';

Button.HOVER_OPACITY = 0.5;
Button.HOVER_TRANSITION_STEPS = 10;
