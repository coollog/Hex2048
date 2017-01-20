'use strict'

const mongodb = require('mongodb');

const addScore = require('./addScore.js');

// Constants
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

const MONGO_URI = `mongodb://ds117348.mlab.com:17348/hex2048`;

console.log('Loading function');

class AddScore {
  constructor(params) {
    this._name = params.name;
    this._score = params.score;
  }
  
  run(collection, echo) {
    if (!this._name || !this._score) {
      return echo(new ErrorResponse('name or score not valid'));
    }
    
    const filter = { name: this._name };
    const doc = { name: this._name, score: this._score };
    const update = { $set: doc };
    const options = { upsert: true };
    
    collection.updateOne(filter, update, options, (err, res) => {
      if (err) throw err;
      
      echo(new SuccessResponse());
    });
  }
};

class GetRank {
  constructor(params) {
    this._score = params.score;
  }
  
  run(collection, echo) {
    if (!this._score) {
      return echo(new ErrorResponse('score not valid'));
    }
    
    const query = { score: { $gt: this._score } };
    
    collection.count(query, (err, count) => {
      if (err) throw err;
      
      echo(new SuccessResponse({ rank: count + 1 }));
    })
  }
};

class GetScores {
  constructor(params) {
    this._limit = params.limit;
  }
  
  run(collection, echo) {
    if (isNaN(this._limit)) {
      return echo(new ErrorResponse('limit not valid'));
    }
    
    const sort = { score: -1 };
    const project = { _id: 0 };
    
    collection.find({})
        .project(project).sort(sort).limit(this._limit).toArray((err, docs) => {
          if (err) throw err;
          
          echo(new SuccessResponse({ scores: docs }))
        });
  }
}

class ErrorResponse {
  constructor(errMsg) {
    return { error: errMsg };
  }
};

class SuccessResponse {
  constructor(otherProps) {
    if (otherProps === undefined) otherProps = {};
    
    return Object.assign({ success: true }, otherProps);
  }
};

function execute(event, scoresCollection, echo) {
  const type = event.type;
  
  console.log('Got type', type);
  
  switch (type) {
  case 'addScore':
    (new AddScore(event)).run(scoresCollection, echo);
    break;
  case 'getRank':
    (new GetRank(event)).run(scoresCollection, echo);
    break;
  case 'getScores':
    (new GetScores(event)).run(scoresCollection, echo);
    break;
  default:
    echo(new ErrorResponse('unrecognized type'));
  }
}

function connectToMongoDb(context, callback) {
  console.log("Connecting to Mongo");
  
  mongodb.MongoClient.connect(MONGO_URI, (err, db) => {
    if (err) throw err;
    
    db.authenticate(DB_USER, DB_PASS, (err, res) => {
      if (err) throw err;
      
      console.log("Connected to mongo");
      const scoresCollection = db.collection('scores');
      
      callback(scoresCollection, finish.bind(this, db, context));
    });
  });
}

function finish(db, context, response) {
  db.close();
  console.log('Done');
  context.done(null, response);
}

exports.handler = function(event, context) {
  connectToMongoDb(context, execute.bind(this, event));
};
