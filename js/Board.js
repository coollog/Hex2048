// import 'Coordinate'
// import 'Hexagon'
// import 'HexagonBackground'

class Board {
  constructor(canvas, center, numPerEdge, radius) {
    assertParameters(arguments, Canvas, Coordinate, Number, Number);
    
    this._canvas = canvas;
    this._center = center;
    this._numPerEdge = numPerEdge;
    this._radius = radius;
    this._centerToEdge = this._radius * Math.sqrt(3) / 2;
    this._width = this._numPerEdge * 2 - 1;
    this._score = 0;
    
    this._fading = false;
    this._opacity = 1.0;      // This will decrease when lost to cause fading out
    
    // Initiate 2d array of hexagons and the hexagon background (creates the grid)
    this.hexagons = [];
    for (let x = 0; x < this._width; x++) {
      this.hexagons.push(new Array(this._width));
    }
    this.hexagonBackgrounds = [];
    for (let x = 0; x < this._width; x++) {
      this.hexagonBackgrounds.push(new Array(this._width));
    }
    
    this.startingIndices = [];
    
    // Create iterators
    this._defineIters();
    
    // Bind drawAll to draw event
    Events.on(DrawTimer.EVENT_TYPES.DRAW, this._drawAll, this);
    
    
    // Todo: Remove; just here to test lost functionality
    this._maxMoves = 3;
    
    // Add the buttons
    const butExitEnv = Board._getExitButtonEnvelope(this._canvas);
    const butRestartEnv = Board._getRestartButtonEnvelope(this._canvas);
    
    this._butExit = new Button(this._canvas, butExitEnv,'Exit');
    this._butRestart = new Button(this._canvas, butRestartEnv,'Restart');
    
    this._butExit.onClick(this._exit.bind(this));
    this._butRestart.onClick(this._restart.bind(this));
  }
  
  // Converts row,col indices to an XY coordinate.
  indexToXY(row, col) {
    assertParameters(arguments, Number, Number);
    
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
    assertParameters(arguments);
    
    for (let col = 0; col < this._width; col ++) {
      for (let row = 0; row < this._width; row ++) {
        // Create each hexagon.
        if (!this._isIndexInside(col, row)) continue;
        
        const xy = this.indexToXY(col, row);
        let hexagon = 
            new Hexagon(this._canvas, xy, this._radius - Hexagon.SPACING);
        hexagon.text = '';
        this.hexagons[col][row] = hexagon;
        
        // Create background hexagon.
        this.hexagonBackgrounds[col][row] =
            new HexagonBackground(this._canvas, xy, this._radius + Hexagon.SPACING);
      }
    }
  }
  
  // Collapse towards dir; returned is an object with two fields:
  // - changed: whether or there was a hexagon that was changed
  // TODO: Change this to a separate class.
  // - result: a 2d array of:
  //    {before: the value in this hexagon before collapse,
  //     after:  the value in this hexagon after collapse,
  //     change: the (row,col) this hexagon moved to}
  collapse(dir) {
    assertParameters(arguments, Number);
    
    // This will state whether or not a hexagon was changed
    let changed = false;
    
    // Create a result array (this will be returned)
    let result = new Array(this._width);
    
    for (let col = 0; col < this._width; col ++) {
      result[col] = new Array(this._width);
      
      for (let row = 0; row < this._width; row ++) {
        const hexagon = this.hexagons[col][row];
        
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
    const starters = this._findStartingIndices(dir);
    
    // Iterate through each line and combine/compress as needed
    for (let line = 0; line < this._width; line++) {
      // Helper func: Update curH value and perform other needed actions
      // Note that result.change at iIndices and jIndices (optional) will be 
      //    updated with where the hexagon WILL move to
      function updateCurH(newValue, iIndices, jIndices) {
        assertParameters(arguments, String, Array, [Array, undefined]);
        
        curH.after = newValue;
        changed = changed || curH.before !== curH.after;
        
        let curIndices = indicesInLine[curIndex];

        if (iIndices[0] !== curIndices[0] || iIndices[1] !== curIndices[1]) {
          result[iIndices[0]][iIndices[1]].change = [curIndices[0], curIndices[1]];
        }
        
        // If jIndices (optional) was supplied
        if (typeof jIndices !== 'undefined') {
          if (jIndices[0] !== curIndices[0] || jIndices[1] !== curIndices[1]) {
            result[jIndices[0]][jIndices[1]].change = [curIndices[0], curIndices[1]];
          }
        }
        
        curIndex++;
      }

      // Create a list of indices of the hexagons in the line
      let indicesInLine = [starters[line]];
      for (let i = 1; i < this._width; i++) {
        const temp = indicesInLine[i - 1];
        
        // All hexagons have been considered in this line so break out of loop
        if (typeof temp === 'undefined') break;
        
        const col = indicesInLine[i - 1][0] + this._iters[dir].line.col;
        const row = indicesInLine[i - 1][1] + this._iters[dir].line.row;
        
        // Check if this is a valid hexagon
        if (col < this._width && row < this._width && col >= 0 && row >= 0) {
          let hexagon = this.hexagons[col][row];
          if (typeof hexagon !== 'undefined') {
            indicesInLine.push([col, row]);
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
        var curH = result[indicesInLine[curIndex][0]][indicesInLine[curIndex][1]];
        var iH = this.hexagons[indicesInLine[i][0]][indicesInLine[i][1]];
        var jH = this.hexagons[indicesInLine[j][0]][indicesInLine[j][1]];
        
        if (iH.text === '') {
          // console.log("this is empty");
          
          i = j;
          j++;
        } else {
          if (jH.text === '') {
            // console.log("next is empty");
            
            j++;
          } else {
            if (iH.text === jH.text) {
              // console.log("combine this and next");
              
              // Add to score if two blocks are combined
              let doubled = parseInt(iH.text) * 2;
              this._score += doubled;
              
              updateCurH(doubled.toString(), indicesInLine[i], indicesInLine[j]);

              // Move i to be the next j (since j and i have already combined)
              j++;
              i = j;
              j++;
            } else {
              // console.log("don't combine this and next");
              
              updateCurH(iH.text, indicesInLine[i]);
              
              i = j;
              j++;
            }
          }
        }
        
        k++;
      }
      
      // Update curH because curIndex might have been updated
      curH = result[indicesInLine[curIndex][0]][indicesInLine[curIndex][1]];
      
      // Check if there is a value at the end of the line that needs to be copied
      // into curH (iH location)
      if (i < indicesInLine.length) {
        iH = this.hexagons[indicesInLine[i][0]][indicesInLine[i][1]];
        if (iH.text != '') {
          updateCurH(iH.text, indicesInLine[i]);
          
          // Check if this is the last hex in the line; if so, don't need to check j
          if (i == indicesInLine.length - 1) {
            continue;
          } else {
            curH = result[indicesInLine[curIndex][0]][indicesInLine[curIndex][1]];
          }
        }
      }
      
      // Check if there is a value at the end of the line that needs to be copied
      // into curH (jH location)
      if (j < indicesInLine.length) {
        jH = this.hexagons[indicesInLine[j][0]][indicesInLine[j][1]];
        if (jH.text != '') {
          updateCurH(jH.text, indicesInLine[j]);
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
    assertParameters(arguments);
    
    while (true) {
      let col = Math.floor(Math.random() * (this._width));
      let row = Math.floor(Math.random() * (this._width));
      
      let hexagon = this.hexagons[col][row];
      if (typeof hexagon !== 'undefined' && hexagon.text == '') {
        // Note that purposely harder to get a 8 than 2 or 4
        if (Math.random() < 0.8) {
          hexagon.text = Math.random() < 0.5 ? '2' : '4';
        } else {
          hexagon.text = '8';
        }
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
  
  // Return true if fading (occurs when player lost; transitions to Lost state)
  get fading() {
    return this._fading;
  }
  
  // Return the number of hexagons without numbers left
  numberOpen() {
    assertParameters(arguments);
    
    let open = 0;
    
    for (let row of this.hexagons) {
      for (let hexagon of row) {
        if (hexagon !== undefined && hexagon.text === '') open++;
      }
    }
    
    return open;
  }
  
  // Return true if player lost
  lost() {
    assertParameters(arguments);
    
    if (--this._maxMoves <= 0) return true;
    
    if (this.numberOpen() > 0) return false;
  
    for (let dir = 0; dir < 6; dir++) {
      const result = this.collapse(dir);
      
      // If collapsing in a direction changes board, then it means can move
      if (result.changed) return false;
    }
    
    return true;
  }
  
  // Initiate fade
  startFade() {
    assertParameters(arguments);
    
    // Remove both buttons
    if (this._butExit) {
      this._butExit.remove();
      this._butExit = undefined;
    }
    
    if (this._butRestart) {
      this._butRestart.remove();
      this._butRestart = undefined;
    }
    
    this._fading = true;
  }
  
  // Deactivate all events related to this page.
  remove() {
    assertParameters(arguments);
    
    Events.off(DrawTimer.EVENT_TYPES.DRAW, this);
    
    function removeHex(hexagon) {
      hexagon.remove();
    }
    
    Board.iterHexagons(this.hexagons, removeHex);
    Board.iterHexagons(this.hexagonBackgrounds, removeHex);
  }
  
  static iterHexagons(hexagons, func) {
    for (let col of hexagons) {
      for (let hexagon of col) {
        if (hexagon === undefined) continue;
        
        func(hexagon);
      }
    }
  }
  
  static get _BUTTON_SIZE() {
    return new Size(HighScore._BUTTON_WIDTH, HighScore._BUTTON_HEIGHT);
  }
  
  static _getExitButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, 0)).toCoordinate()
        .translate(new Coordinate(-(Board._BUTTON_WIDTH + 5), 5))
        
    return new Envelope(topLeft, Board._BUTTON_SIZE);
  }
  
  static _getRestartButtonEnvelope(canvas) {
    assertParameters(arguments, Canvas);
    
    const topLeft = (new Size(canvas.width, 0)).toCoordinate()
        .translate(new Coordinate(-(Board._BUTTON_WIDTH * 2 + 10), 5))
        
    return new Envelope(topLeft, Board._BUTTON_SIZE);
  }
  
  // Draw the score at the top left corner
  _drawAll() {
    assertParameters(arguments);
    
    if (this._fading) {
      this._increaseFade();
    }
    
    function drawScore() {
      this._canvas.drawText(
          Board._SCORE_COORD, this._score.toString(), 'left', Board._SCORE_FONT);
    }
    
    this._canvas.drawWithOpacity(this._opacity, drawScore.bind(this));
  }
  
  // Define the iterator values (should only be called once in constructor)
  _defineIters() {
    assertParameters(arguments);
    
    const ITER_TOP_RIGHT = {
      start:  {col: 0,                          row: this._numPerEdge - 1},
      first:  {col: 0,                          row: 1},
      second: {col: 1,                          row: 0},
      line:   {col: 1,                          row: -1}
    };
    
    const ITER_UP = {
      start:  {col: this._numPerEdge - 1,       row: 0},
      first:  {col: -1,                         row: 1},
      second: {col: 0,                          row: 1},
      line:   {col: 1,                          row: 0}
    };
    
    const ITER_TOP_LEFT = {
      start:  {col: (this._numPerEdge - 1) * 2, row: 0},
      first:  {col: -1,                         row: 0},
      second: {col: -1,                         row: 1},
      line:   {col: 0,                          row: 1}
    };
    
    const ITER_BOTTOM_LEFT = {
      start:  {col: this._numPerEdge - 1,       row: 0},
      first:  {col: 1,                          row: 0},
      second: {col: 0,                          row: 1},
      line:   {col: -1,                         row: 1}
    };
    
    const ITER_DOWN = {
      start:  {col: (this._numPerEdge - 1) * 2, row: 0},
      first:  {col: 0,                          row: 1},
      second: {col: -1,                         row: 1},
      line:   {col: -1,                         row: 0}
    };
    
    const ITER_BOTTOM_RIGHT = {
      start:  {col: (this._numPerEdge - 1) * 2, row: this._numPerEdge - 1},
      first:  {col: -1,                         row: 1},
      second: {col: -1,                         row: 0},
      line:   {col: 0,                          row: -1}
    };
    
    this._iters = [ITER_TOP_RIGHT, ITER_UP, ITER_TOP_LEFT, 
        ITER_BOTTOM_LEFT, ITER_DOWN, ITER_BOTTOM_RIGHT];
  }
  
  // Find starting indices
  _findStartingIndices(dir) {
    assertParameters(arguments, Number);
    
    const iter = this._iters[dir];
    
    let indices = [];
    
    indices.push([iter.start.col, iter.start.row]);
    
    for (let i = 1; i < this._width; i++) {
      indices.push([
        indices[i - 1][0] + ((i < this._numPerEdge) ? iter.first.col : iter.second.col),
        indices[i - 1][1] + ((i < this._numPerEdge) ? iter.first.row : iter.second.row)
      ]);
    }
    
    return indices;
  }
  
  // Returns true if (row, col) is a valid hexagon position.
  _isIndexInside(row, col) {
    assertParameters(arguments, Number, Number);
    
    const half = this._numPerEdge - 1;
    const colStart = 0;
    const colEnd = this._width;
    const rowStart = Math.max(0, half - col);
    const rowEnd = rowStart + this._verticalLength(col);
    return row >= rowStart && row < rowEnd && col >= colStart && col < colEnd;
  }
  
  // Calculates the number of hexagons in the column 'col'.
  _verticalLength(col) {
    assertParameters(arguments, Number);
    
    const half = this._numPerEdge - 1;
    return 2 * half - Math.abs(half - col) + 1;
  }
  
  // This is called every time in draw if fading out.  Opacity will decrease and
  // cause everything to fade out
  _increaseFade() {
    assertParameters(arguments);
    
    const increments = 1.0 / Board._FADE_OUT_FRAMES;
    this._opacity -= increments;
    
    // If have finished fading, then dispatch event
    if (this._opacity <= 0.1) {
      Events.dispatch(Board.EVENT_TYPES.FINISHED_FADING);
      return;
    }
    
    // Set the opacity of hexagons to be lower (let them fade out)
    function fadeHex(hexagon) {
      hexagon.opacity = this._opacity;
    }
    
    Board.iterHexagons(this.hexagons, fadeHex.bind(this));
    Board.iterHexagons(this.hexagonBackgrounds, fadeHex.bind(this));
  }
  
  _exit(button) {
    // Prevent this from being activated multiple times
    button.disable();
    
    // Go back to home (which will change the state)
    Events.dispatch(Board.EVENT_TYPES.GOTO_HOME);
  }
  
  _restart(button) {
    // Prevent this from being activated multiple times
    button.disable();
    
    // Go back to home (which will change the state)
    Events.dispatch(Board.EVENT_TYPES.GOTO_STARTING);
  }
};

Board._BUTTON_WIDTH = 100;
Board._BUTTON_HEIGHT = 30;
Board._FADE_OUT_FRAMES = 350;

Board._SCORE_COORD = new Coordinate(10, 15);
Board._SCORE_FONT = '30px Arial';

Board.EVENT_TYPES = {
  GOTO_HOME: 'board-goto-home',
  GOTO_STARTING: 'board-goto-starting',
  FINISHED_FADING: 'board-finished-fading'
};
