// DDO for an input direction.
class InputDirection {
  constructor(direction) {
    this._direction = direction;
  }
  
  get direction() {
    return this._direction;
  }
};

// Counter-clockwise, from right.
InputDirection.DIRECTIONS = {
  TOP_RIGHT: 0, 
  UP: 1,
  TOP_LEFT: 2,
  BOTTOM_LEFT: 3, 
  DOWN: 4,
  BOTTOM_RIGHT: 5
};
