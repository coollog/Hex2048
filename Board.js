// import 'Coordinate'
// import 'Hexagon'

class Board {
  constructor(canvas, coord, numPerEdge, radius) {
    this._canvas = canvas;
    this._coord = coord;
    this._numPerEdge = numPerEdge;
    this._radius = radius;
    this._centerToEdge = this._radius * Math.sqrt(3) / 2;
    this.hexagons = [];
    
    for (let x = 0; x < this._numPerEdge * 2 - 1; x++) {
      this.hexagons.push(new Array(this._numPerEdge * 2 - 1));
    }
    
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._drawAll.bind(this));
  }
  
  // Create all of the hexagon shapes
  createAll() {
    let xy = this._findFirstXY();
    
    // Number of hexagons in this vertical line
    let vertNum = this._numPerEdge;
    
    let xIndex = this._numPerEdge - 1;

    for (let horiz = 0; horiz < this._numPerEdge * 2 - 1; horiz++) {
      for (let vert = 0; vert < vertNum; vert++) {
        let hexagon = new Hexagon(this._canvas, new Coordinate(xy.x, xy.y), this._radius);
        hexagon.setText('');
        this.hexagons[xIndex + vert][horiz] = hexagon;
        
        xy.y = xy.y + this._centerToEdge * 2;
      }
      
      if (horiz < this._numPerEdge - 1) {
        xy.x = xy.x + this._radius * 1.5;
        xy.y = xy.y - this._centerToEdge * (vertNum * 2 + 1);
        vertNum++;
      } else {
        vertNum--;
        xy.x = xy.x + this._radius * 1.5;
        xy.y = xy.y - this._centerToEdge * (vertNum * 2 + 1);
      }
      
      xIndex = Math.max(xIndex - 1, 0);
    }
    
  }
  
  // Draw all of the hexagon shapes and their text
  _drawAll() {
    for (let horiz = 0; horiz < this.hexagons.length; horiz++) {
      for (let vert = 0; vert < this.hexagons[horiz].length; vert++) {
        let hexagon = this.hexagons[horiz][vert];
        if (hexagon != undefined) {
          hexagon.drawShape();
          hexagon.drawText();
        }
      }
    }
  }
  
  // Find center of the top left-most hexagon
  _findFirstXY() {
    let x = this._coord.x + this._radius;
    let y = this._coord.y + this._centerToEdge * this._numPerEdge;
    
    return new Coordinate(x, y);
  }
  
  // Find an empty block and put a 2 or 4 in it
  addRandom() {
    let added = false;
    while (added) {
      let x = Math.floor(Math.random() * (this._numPerEdge * 2) - 1);
      let y = Math.floor(Math.random() * (this._numPerEdge * 2) - 1);
    }
  }
}