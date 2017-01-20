// import 'Easing'

/**
 * Handles interpolating between values.
 */
class Transition {
  // Interpolate between 'val1' and 'val2' over 'steps' intervals with the 
  // 'interpolate' function and an 'easing'.
  constructor(val1, val2, steps, easing = Easing.Linear, 
      interpolateFn = Transition.interpolate) {
    assertParameters(arguments, 
        [Number, Object], [Number, Object], Number, [Function, undefined], 
        [Function, undefined]);
    
    this._val1 = val1;
    this._val2 = val2;
    this._maxSteps = steps;
    this._easing = easing;
    this._interpolate = interpolateFn;
    
    this._value = this._val1;
    this._curStep = 0;
  }
  
  static interpolate(val1, val2, scale) {
    assertParameters(arguments, Number, Number, Number);
    
    return val1 + scale * (val2 - val1);
  }
  
  get value() {
    return this._value;
  }
  get isDone() {
    return this._curStep === this._maxSteps;
  }
  
  // Take one step in the interpolation.
  update() {
    assertParameters(arguments);
    
    if (this.isDone) return false;
    
    const scale = (this._curStep ++) / this._maxSteps;
    this.scale(scale);
    
    return true;
  }
  
  // Scale the transition by a 'scale' from [0, 1].
  scale(scale) {
    const eased = this._easing(scale);
    
    this._value = this._interpolate(this._val1, this._val2, eased);
  }
  
  // Restart the transition towards a new target.
  changeTarget(val2, steps) {
    assertParameters(arguments, Number, Number);
    
    this._val1 = this._value;
    this._val2 = val2;
    this._maxSteps = steps;
    this._curStep = 0;
  }
};
