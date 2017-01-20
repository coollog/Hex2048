/**
 * Defines easing functions for animation.
 * All functions should be from (0, 0) to (1, 1).
 */
const Easing = {
  Linear(scale) {
    return scale;
  },
  
  CubicOut(scale) {
    assertParameters(arguments, Number);
    
    const invScale = 1 - scale;
    return 1 - invScale * invScale * invScale;
  },
  
  CubicIn(scale) {
    assertParameters(arguments, Number);
    
    return scale * scale * scale;
  },
  
  CubicInOut(scale) {
    assertParameters(arguments, Number);
    
    if (scale < 0.5) {
      return Easing.CubicIn(scale * 2) / 2;
    }
    return Easing.CubicOut(scale * 2 - 1) / 2 + 0.5;
  }
};
