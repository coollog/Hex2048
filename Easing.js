/**
 * Defines easing functions for animation.
 * All functions should be from (0, 0) to (1, 1).
 */
const Easing = {
  CubicOut(scale) {
    const invScale = 1 - scale;
    return 1 - invScale * invScale * invScale;
  },
  
  CubicIn(scale) {
    return scale * scale * scale;
  },
  
  CubicInOut(scale) {
    if (scale < 0.5) {
      return Easing.CubicIn(scale * 2) / 2;
    }
    return Easing.CubicOut(scale * 2 - 1) / 2 + 0.5;
  }
};
