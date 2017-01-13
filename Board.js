// import 'Coordinate'
// import 'Hexagon'

class Board {
  constructor(canvas, center, numPerEdge, radius) {
    this._canvas = canvas;
    this._center = center;
    this._numPerEdge = numPerEdge;
    this._radius = radius;
    this._centerToEdge = this._radius * Math.sqrt(3) / 2;
    this._width = this._numPerEdge * 2 - 1;
    this._score = 0;
    
    this.hexagons = [];
    for (let x = 0; x < this._width; x++) {
      this.hexagons.push(new Array(this._width));
    }
    
    this.startingIndices = [];
    
    // Create iterators
    this._defineIters();
    
    // Bind drawAll to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._drawAll.bind(this));
  }
  
  // Create all of the hexagon shapes
  createAll() {
    for (let row = 0; row < this._width; row ++) {
      for (let col = 0; col < this._width; col ++) {
        // Create each hexagon.
        if (!this._isIndexInside(row, col)) continue;
        
        const xy = this._indexToXY(row, col);
        let hexagon = 
            new Hexagon(this._canvas, this._center.translate(xy), this._radius);
        hexagon.text = '';
        this.hexagons[row][col] = hexagon;
      }
    }
  }
  
  // Collapse towards dir; returned is an object with two fields:
  // - changed: whether or there was a hexagon that was changed
  // - result: a 2d array of:
  //    {before: the value in this hexagon before collapse,
  //     after:  the value in this hexagon after collapse}
  // TODO: Change to:
  // - result: a 2d array of:
  //    {before: the value in this hexagon before collapse,
  //     after:  the value in this hexagon after collapse,
  //     change: the (row,col) this hexagon moved to}
  collapse(dir) {
    // This will state whether or not a hexagon was changed
    let changed = false;
    
    // Create a result array (this will be returned)
    let result = [];
    
    for (let row = 0; row < this._width; row ++) {
      let temp = []
      for (let col = 0; col < this._width; col ++) {
        let hexagon = this.hexagons[row][col];
        
        // Add in the before values; undefined if hexagon does not exist
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
    for (let line = 0; line < this._width; line++) {
      // Create a list of indices of the hexagons in the line
      let indicesInLine = [starters[line]];
      for (let i = 1; i < this._width; i++) {
        let temp = indicesInLine[i - 1];
        
        // All hexagons have been considered in this line so break out of loop
        if (typeof temp === 'undefined') break;
        
        let x = indicesInLine[i - 1].x + this._iters[dir].line.x;
        let y = indicesInLine[i - 1].y + this._iters[dir].line.y;
        
        // Check if this is a valid hexagon
        if (x < this._width && y < this._width &&
            x >= 0 && y >= 0) {
          let hexagon = this.hexagons[x][y];
          if (typeof hexagon !== 'undefined') {
            indicesInLine.push({x: x, y: y});
          }
        } else {
          // If a hexagon is not valid, then all others following same order will
          // also be invalid
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
              
              // Add to score if two blocks are combined
              let doubled = parseInt(thisH.text) * 2;
              this._score += doubled;
              
              curH.after = doubled;
              changed = changed || curH.before != curH.after;
              curIndex++;
              
              // Move i to be the next j (since j and i have already combined)
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
      
      // Check if there is a value at the end of the line that needs to be copied
      // into curH (thisH location)
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
      
      // Check if there is a value at the end of the line that needs to be copied
      // into curH (nextH location)
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
  
  // Update board with the after values in result.
  updateWithResult(result) {
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._width; y++) {
        if (typeof this.hexagons[x][y] !== 'undefined') {
          this.hexagons[x][y].text = result[x][y].after;
        }
      }
    }
    return this;
  }
  
  // Find an empty block and put a 2 or 4 in it
  addRandom() {
    let added = true;
    while (added) {
      let x = Math.floor(Math.random() * (this._width));
      let y = Math.floor(Math.random() * (this._width));
      
      let hexagon = this.hexagons[x][y];
      if (typeof hexagon !== 'undefined' && hexagon.text == '') {
        added = false;
        hexagon.text = (Math.floor(Math.random() * 2)) ? '2' : '4'; 
      }
    }
  }
  
  // Return the score
  get score() {
    return this._score;
  }
  
  // Return true if player lost
  lost() {
    if (this._isFilled()) {
      let cantMove = true;
      
      let result;
      for (let dir = 0; dir < 6; dir++) {
        result = this.collapse(dir);
        
        // If collapsing in a direction changes board, then it means can move
        cantMove = cantMove && !result.changed
      }
      
      return cantMove;
    } else {
      return false;
    }
  }
  
  // Draw all of the hexagon shapes and their text; draw score
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
    
    this._drawScore();
  }
  
  _drawScore() {
    this._canvas.drawText(new Coordinate(10, 15), this._score, 'left', '30px Arial');
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
    
    for (let i = 1; i < this._width; i++) {
      indices.push({
        x: indices[i - 1].x + ((i < this._numPerEdge) ? iter.first.x : iter.second.x),
        y: indices[i - 1].y + ((i < this._numPerEdge) ? iter.first.y : iter.second.y)
      })
    }
    
    // for (let i = 0; i < this._width; i++) {
    //   console.log(indices[i].x + "," + indices[i].y);
    // }
    
    return indices;
  }
  
  // If all the hexagons are filled with numbers
  _isFilled() {
    let filled = true;
    
    for (let horiz = 0; horiz < this.hexagons.length; horiz++) {
      for (let vert = 0; vert < this.hexagons[horiz].length; vert++) {
        let hexagon = this.hexagons[horiz][vert];
        if (hexagon != undefined) {
          filled = filled && (hexagon.text != '');
        }
      }
    }
    
    return filled;
  }
  
  
  // Returns true if (row, col) is a valid hexagon position.
  _isIndexInside(row, col) {
    const half = this._numPerEdge - 1;
    const colStart = 0;
    const colEnd = this._width;
    const rowStart = Math.max(0, half - col);
    const rowEnd = rowStart + this._verticalLength(col);
    return row >= rowStart && row < rowEnd && col >= colStart && col < colEnd;
  }
  
  // Calculates the number of hexagons in the column 'col'.
  _verticalLength(col) {
    const half = this._numPerEdge - 1;
    return 2 * half - Math.abs(half - col) + 1;
  }
  
  // Converts row,col indices to a relative XY coordinate.
  _indexToXY(row, col) {
    // Put origin at center.
    row = row - this._numPerEdge + 1;
    col = col - this._numPerEdge + 1;
    // Units of x and y.
    const xUnits = col;
    const yUnits = row + 0.5 * col;
    // Scale the units.
    const x = xUnits * this._radius * 1.5;
    const y = yUnits * this._centerToEdge * 2;
    
    return new Coordinate(x, y);
  }
}