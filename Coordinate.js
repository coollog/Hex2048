class Coordinate {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }
  
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  set x(x) {
    this._x = x;
  }
  set y(y) {
    this._y = y;
  }

  // Calculate distance to 'other' Coordinate.
  distanceTo(other) {
    const xDiff = this._x - other.x;
    const yDiff = this._y - other.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }
  
  // Calculate angle to 'other' Coordinate.
  angleTo(other) {
    const yDiff = this._y - other.y;
    const xDiff = other.x - this._x;
    return (Math.atan2(yDiff, xDiff) + 2 * Math.PI) % (2 * Math.PI);
  }

  toArray() {
    return [this._x, this._y];
  }
}