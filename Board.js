// import 'Coordinate'
// import 'Hexagon'
// import 'HexagonBackground'

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
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._drawAll, this);
  }
  
  // Converts row,col indices to an XY coordinate.
  indexToXY(row, col) {
    // Put origin at center.
    row = row - this._numPerEdge + 1;
    col = col - this._numPerEdge + 1;
    // Units of x and y.
    const xUnits = col;
    const yUnits = row + 0.5 * col;
    // Scale the units.
    const x = xUnits * this._radius * 1.5;
    const y = yUnits * this._centerToEdge * 2;
    
    return this._center.translate(new Coordinate(x, y));
  }

  // Create all of the hexagon shapes
  createAll() {
    for (let row = 0; row < this._width; row ++) {
      for (let col = 0; col < this._width; col ++) {
        // Create each hexagon.
        if (!this._isIndexInside(row, col)) continue;
        
        const xy = this.indexToXY(row, col);
        let hexagon = 
            new Hexagon(this._canvas, xy, this._radius - Hexagon.SPACING);
        hexagon.text = '';
        this.hexagons[row][col] = hexagon;
        
        // Create background hexagon.
        new HexagonBackground(this._canvas, xy, this._radius + Hexagon.SPACING);
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
    let result = new Array(this._width);
    
    for (let col = 0; col < this._width; col ++) {
      result[col] = new Array(this._width);
      
      for (let row = 0; row < this._width; row ++) {
        let hexagon = this.hexagons[col][row];
        
        // Add in the before values; undefined if hexagon does not exist
        result[col][row] = {
          before: (typeof hexagon !== 'undefined') ? hexagon.text : undefined,
          after: (typeof hexagon !== 'undefined') ? '' : undefined,
          change: [col, row]
        };
      }
    }
    
    // Find the first hexagon for each line (note first here means the one furthest
    // on the side where all of the hexagons will be compressed to)
    let starters = this._findStartingIndices(dir);
    
    // Iterate through each line and combine/compress as needed
    for (let line = 0; line < this._width; line++) {
      // Helper func: Update curH value and perform other needed actions
      // Note that result.change at iIndex and jIndex (optional) will be updated with
      //    where the hexagon WILL move to
      function updateCurH(newValue, iIndex, jIndex) {
        curH.after = newValue;
        changed = changed || curH.before != curH.after;
        
        result[iIndex.x][iIndex.y].change = [indicesInLine[curIndex].x, indicesInLine[curIndex].y];
        if (typeof jIndex !== 'undefined') {
          result[jIndex.x][jIndex.y].change = [indicesInLine[curIndex].x, indicesInLine[curIndex].y];
        }
        
        curIndex++;
      }

      // Create a list of indices of the hexagons in the line
      let indicesInLine = [starters[line]];
      for (let i = 1; i < this._width; i++) {
        let temp = indicesInLine[i - 1];
        
        // All hexagons have been considered in this line so break out of loop
        if (typeof temp === 'undefined') break;
        
        let x = indicesInLine[i - 1].x + this._iters[dir].line.col;
        let y = indicesInLine[i - 1].y + this._iters[dir].line.row;
        
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
              
              updateCurH(doubled, indicesInLine[i], indicesInLine[j]);

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
          updateCurH(thisH.text, indicesInLine[i]);
          if (i == indicesInLine.length - 1) {
            continue;
          } else {
            curH = result[indicesInLine[curIndex].x][indicesInLine[curIndex].y];
          }
        }
      }
      
      // Check if there is a value at the end of the line that needs to be copied
      // into curH (nextH location)
      if (j < indicesInLine.length) {
        nextH = this.hexagons[indicesInLine[j].x][indicesInLine[j].y];
        if (nextH.text != '') {
          updateCurH(nextH.text, indicesInLine[j]);
        }
      }
    }
    
    return {
      changed: changed,
      result: result
    };
  }
  
  // Update board with the after values in result.
  updateWithResult(results) {
    for (let col = 0; col < this._width; col++) {
      for (let row = 0; row < this._width; row++) {
        const hexagon = this.hexagons[col][row];
        if (typeof hexagon === 'undefined') continue;
        
        const {before, after, change} = results[col][row];
        const [newRow, newCol] = change;
        
        hexagon.text = after;
        
        // If changed value and not to blank, then blink!
        if (after !== before && after !== '') {
          hexagon.startBlink();
        }
      }
    }
    return this;
  }
  
  // Find an empty block and put a 2 or 4 in it
  addRandom() {
    while (true) {
      let x = Math.floor(Math.random() * (this._width));
      let y = Math.floor(Math.random() * (this._width));
      
      let hexagon = this.hexagons[x][y];
      if (typeof hexagon !== 'undefined' && hexagon.text == '') {
        hexagon.text = Math.random() < 0.5 ? '2' : '4'; 
        break;
      }
    }
  }
  
  get canvas() {
    return this._canvas;
  }
  
  get radius() {
    return this._radius;
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
    this._drawScore();
  }
  
  _drawScore() {
    this._canvas.drawText(new Coordinate(10, 15), this._score, 'left', '30px Arial');
  }
  
  // Define the iterator values (should only be called once in constructor)
  _defineIters() {
    let ITER_TOP_RIGHT = {
      start:  {col: 0,                          row: this._numPerEdge - 1},
      first:  {col: 0,                          row: 1},
      second: {col: 1,                          row: 0},
      line:   {col: 1,                          row: -1}
    }
    
    let ITER_UP = {
      start:  {col: this._numPerEdge - 1,       row: 0},
      first:  {col: -1,                         row: 1},
      second: {col: 0,                          row: 1},
      line:   {col: 1,                          row: 0}
    }
    
    let ITER_TOP_LEFT = {
      start:  {col: (this._numPerEdge - 1) * 2, row: 0},
      first:  {col: -1,                         row: 0},
      second: {col: -1,                         row: 1},
      line:   {col: 0,                          row: 1}
    }
    
    let ITER_BOTTOM_LEFT = {
      start:  {col: this._numPerEdge - 1,       row: 0},
      first:  {col: 1,                          row: 0},
      second: {col: 0,                          row: 1},
      line:   {col: -1,                         row: 1}
    }
    
    let ITER_DOWN = {
      start:  {col: (this._numPerEdge - 1) * 2, row: 0},
      first:  {col: 0,                          row: 1},
      second: {col: -1,                         row: 1},
      line:   {col: -1,                         row: 0}
    }
    
    let ITER_BOTTOM_RIGHT = {
      start:  {col: (this._numPerEdge - 1) * 2, row: this._numPerEdge - 1},
      first:  {col: -1,                         row: 1},
      second: {col: -1,                         row: 0},
      line:   {col: 0,                          row: -1}
    }
    
    this._iters = [ITER_TOP_RIGHT, ITER_UP, ITER_TOP_LEFT, 
        ITER_BOTTOM_LEFT, ITER_DOWN, ITER_BOTTOM_RIGHT]
  }
  
  // Find starting indices
  _findStartingIndices(dir) {
    let iter = this._iters[dir];
    
    let indices = [];
    
    indices.push({
      x: iter.start.col,
      y: iter.start.row
    });
    
    for (let i = 1; i < this._width; i++) {
      indices.push({
        x: indices[i - 1].x + ((i < this._numPerEdge) ? iter.first.col : iter.second.col),
        y: indices[i - 1].y + ((i < this._numPerEdge) ? iter.first.row : iter.second.row)
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
};
