var index = require('./index.js');

const context = {done: (a, res) => {console.log(res)}};

function invoke(params) {
  index.handler(params, context);
}

// invoke({type: 'addScore', name: 'asdf', score: 200});
// invoke({type: 'addScore', name: 'bob', score: 100});
// invoke({type: 'addScore', name: 'dylan', score: 50});
// invoke({type: 'addScore', name: 'roof', score: 300});
// invoke({type: 'getRank', score: 250});
invoke({type: 'getScores', limit: 10});