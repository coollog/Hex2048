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
    
    this.startingIndices = [];
    
    // Create iterators
    this._defineIters();
    
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
        hexagon.text = '';
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
  
  // Collapse towards dir; returned is an object with two fields:
  // - changed: whether or there was a hexagon that was changed
  // - result: a 2d array of:
  //    {before: the value in this hexagon before collapse,
  //     after:  the value in this hexagon after collapse}
  collapse(dir) {
    // This will state whether or not a hexagon was changed
    let changed = false;
    
    // Create a result array (this will be returned)
    let result = [];
    
    for (let x = 0; x < this._numPerEdge * 2 - 1; x++) {
      let temp = []
      for (let y = 0; y < this._numPerEdge * 2 - 1; y++) {
        let hexagon = this.hexagons[x][y];
        temp.push({
          before: (typeof hexagon !== 'undefined') ? hexagon.text : undefined,
          after: (typeof hexagon !== 'undefined') ? '' : undefined
        })      
      }
      result.push(temp);
    }
    
    // Find the first hexagon for each line (note first here means the one furthest
    // on the side where all of the hexagons will be compressed to)
    let starters = this._findStartingIndices(dir);
    
    // Iterate through each line and combine/compress as needed
    for (let line = 0; line < this._numPerEdge * 2 - 1; line++) {
      // Create a list of indices of the hexagons in the line
      let indicesInLine = [starters[line]];
      for (let i = 1; i < this._numPerEdge * 2 - 1; i++) {
        let temp = indicesInLine[i - 1];
        
        // This line is already complete so break
        if (typeof temp === 'undefined') break;
        
        let x = indicesInLine[i - 1].x + this._iters[dir].line.x;
        let y = indicesInLine[i - 1].y + this._iters[dir].line.y;
        
        if (x < this._numPerEdge * 2 - 1 && y < this._numPerEdge * 2 - 1 &&
            x >= 0 && y >= 0) {
          let hexagon = this.hexagons[x][y];
          if (typeof hexagon !== 'undefined') {
            indicesInLine.push({x: x, y: y});
          }
        } else {
          break;
        }
      }
      
      let curIndex = 0;
      let i = 0;
      let j = 1;
      let k = 1;
      
      while (j < indicesInLine.length && k < 1000) {
        // console.log(indicesInLine[i].x + ',' + indicesInLine[i].y);
        var curH = result[indicesInLine[curIndex].x][indicesInLine[curIndex].y];
        var thisH = this.hexagons[indicesInLine[i].x][indicesInLine[i].y];
        var nextH = this.hexagons[indicesInLine[j].x][indicesInLine[j].y];
        
        if (thisH.text == '') {
          // console.log("this is empty");
          
          i = j;
          j++;
        } else {
          if (nextH.text == '') {
            // console.log("next is empty");
            
            j++;
          } else {
            if (thisH.text == nextH.text) {
              // console.log("combine this and next");
              curH.after = parseInt(thisH.text) * 2;
              changed = changed || curH.before != curH.after;
              curIndex++;
              
              j++;
              i = j;
              j++;
            } else {
              // console.log("don't combine this and next");
              curH.after = thisH.text;
              changed = changed || curH.before != curH.after;
              curIndex++;
              
              i = j;
              j++;
            }
          }
        }
        
        k++;
      }
      
      // Update curH because curIndex might have been updated
      curH = result[indicesInLine[curIndex].x][indicesInLine[curIndex].y];
      
      // Check if there needs to be some copying at the end of the line
      if (i < indicesInLine.length) {
        thisH = this.hexagons[indicesInLine[i].x][indicesInLine[i].y];
        if (thisH.text != '') {
          curH.after = thisH.text;
          changed = changed || curH.before != curH.after;
          if (i == indicesInLine.length - 1) {
            continue;
          } else {
            curIndex++;
            curH = result[indicesInLine[curIndex].x][indicesInLine[curIndex].y];
          }
        }
      }
      
      // Check if there needs to be some copying at the end of the line
      if (j < indicesInLine.length) {
        nextH = this.hexagons[indicesInLine[j].x][indicesInLine[j].y];
        if (nextH.text != '') {
          curH.after = nextH.text;
          changed = changed || curH.before != curH.after;
        }
      }
    }
    
    return {
      changed: changed,
      result: result
    };
  }
  
  // Update board with the after values in result
  updateWithResult(result) {
    for (let x = 0; x < this._numPerEdge * 2 - 1; x++) {
      for (let y = 0; y < this._numPerEdge * 2 - 1; y++) {
        if (typeof this.hexagons[x][y] !== 'undefined') {
          this.hexagons[x][y].text = result[x][y].after;
        }
      }
    }
  }
  
  // Find an empty block and put a 2 or 4 in it
  addRandom() {
    let added = true;
    while (added) {
      let x = Math.floor(Math.random() * (this._numPerEdge * 2 - 1));
      let y = Math.floor(Math.random() * (this._numPerEdge * 2 - 1));
      
      let hexagon = this.hexagons[x][y];
      if (typeof hexagon !== 'undefined' && hexagon.text == '') {
        added = false;
        hexagon.text = (Math.floor(Math.random() * 2)) ? '2' : '4'; 
      }
    }
  }
  
  // Find center of the top left-most hexagon
  _findFirstXY() {
    let x = this._coord.x + this._radius;
    let y = this._coord.y + this._centerToEdge * this._numPerEdge;
    
    return new Coordinate(x, y);
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
  
  // Define the iterator values (should only be called once in constructor)
  _defineIters() {
    let ITER_TOP_RIGHT = {
      start:  {x: 0,                          y: this._numPerEdge - 1},
      first:  {x: 0,                          y: 1},
      second: {x: 1,                          y: 0},
      line:   {x: 1,                          y: -1}
    }
    
    let ITER_UP = {
      start:  {x: this._numPerEdge - 1,       y: 0},
      first:  {x: -1,                         y: 1},
      second: {x: 0,                          y: 1},
      line:   {x: 1,                          y: 0}
    }
    
    let ITER_TOP_LEFT = {
      start:  {x: (this._numPerEdge - 1) * 2, y: 0},
      first:  {x: -1,                         y: 0},
      second: {x: -1,                         y: 1},
      line:   {x: 0,                          y: 1}
    }
    
    let ITER_BOTTOM_LEFT = {
      start:  {x: this._numPerEdge - 1,       y: 0},
      first:  {x: 1,                          y: 0},
      second: {x: 0,                          y: 1},
      line:   {x: -1,                         y: 1}
    }
    
    let ITER_DOWN = {
      start:  {x: (this._numPerEdge - 1) * 2, y: 0},
      first:  {x: 0,                          y: 1},
      second: {x: -1,                         y: 1},
      line:   {x: -1,                         y: 0}
    }
    
    let ITER_BOTTOM_RIGHT = {
      start:  {x: (this._numPerEdge - 1) * 2, y: this._numPerEdge - 1},
      first:  {x: -1,                         y: 1},
      second: {x: -1,                         y: 0},
      line:   {x: 0,                          y: -1}
    }
    
    this._iters = [ITER_TOP_RIGHT, ITER_UP, ITER_TOP_LEFT, 
        ITER_BOTTOM_LEFT, ITER_DOWN, ITER_BOTTOM_RIGHT]
  }
  
  // Find starting indices
  _findStartingIndices(dir) {
    let iter = this._iters[dir];
    
    let indices = [];
    
    indices.push({
      x: iter.start.x,
      y: iter.start.y
    });
    
    for (let i = 1; i < this._numPerEdge * 2 - 1; i++) {
      indices.push({
        x: indices[i - 1].x + ((i < this._numPerEdge) ? iter.first.x : iter.second.x),
        y: indices[i - 1].y + ((i < this._numPerEdge) ? iter.first.y : iter.second.y)
      })
    }
    
    // for (let i = 0; i < this._numPerEdge * 2 - 1; i++) {
    //   console.log(indices[i].x + "," + indices[i].y);
    // }
    
    return indices;
  }
}