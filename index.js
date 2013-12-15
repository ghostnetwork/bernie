'use strict';

require('./lib/verdoux/predicates.js');
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('./lib/verdoux/elapsedTime.js')
  , GameLoop = require('./lib/verdoux/gameloop.js')
  , PubSub = require('./lib/verdoux/pubsub.js')
  , Task = require('./lib/koufax/task.js');

function Bernie(options) {
  var that = PubSub.create();

  Object.defineProperty(that, 'options', {get : function() {return _options;},enumerable : true});
  
  that.start = function() {gameLoop.start(); return that;};
  that.drone = Drone.create();

  function onGameLoopTick() {that.drone.performWork();};

  var gameLoop = GameLoop.create(onGameLoopTick);
  var _options = options;

  return that;
};
Bernie.create = function(options) {return new Bernie(options);};
module.exports = Bernie;

function Drone() {
  var that = PubSub.create();

  that.performWork = function(){
    if (notExisty(oneSecondTimer))  {
      /*
      oneSecondTimer = setInterval(retrieveMarketData, 10 * 1000);
      retrieveMarketData();
      */
      if (notExisty(retrieveMarketDataTask)) {
        retrieveMarketDataTask = Task.create('market', retrieveMarketData);
        retrieveMarketDataTask.on(Task.Events.Done, onMarketDone);
        retrieveMarketDataTask.on(Task.Events.MarkedCompleted, onMarketCompleted);
      }
      
      oneSecondTimer = setInterval(onTrigger, 10 * 1000);
      onTrigger();
    }
  };

  function onTrigger() {
    if (retrieveMarketDataTask.isReady()) {
      retrieveMarketDataTask.begin();
    }
  };

  function onMarketDone(result) {
    logResult({market:result.value.market}, result.value.timestamp);
    retrieveMarketDataTask.markCompleted();
  };

  function onMarketCompleted() {
    retrieveMarketDataTask.reset();
  };

  function retrieveMarketData(done) {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      done({market:market, timestamp:timestamp});
      previousLast = market.last;
    });
  };

  function retrieveDepthData(done) {
    var timestamp = Date.now();
    gox.depth('BTCUSD', function(err, depth) {
      done(depth);
    });
  };

  function onDepthDone(result) {
    console.log('#' + result.task.name + ': ' + util.inspect(result.value.bids.length));
    retrieveDepthDataTask.markCompleted();
  };

  function onDepthCompleted() {retrieveDepthDataTask.reset();};

  function logResult(result, timestamp) {
    var market = result.market;
    var now = Date.now();
    var elapsed = now - timestamp;
    var position = btc * market.last;
    var delta = market.last - previousLast;
    var positionDelta = position - originalPosition;
    var positionDeltaPercent = (positionDelta / originalPosition) * 100;

    if (delta !== 0) {
      var message = new Date().toString() + '(' + elapsed + 'ms)';
      message += ' : ' + accounting.formatNumber(market.last, 4);
      message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

      if (existy(previousLast)) {
        var deltaPercent = (delta / market.last) * 100;
        message += '\t[' + accounting.formatNumber(position, 4, '') + ']';
        if (deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(deltaPercent, 2) + '%)\t';
      }
      else {
        message += '\t[' + accounting.formatNumber(position, 4, '') + ']';
        message += '[' + accounting.formatNumber(originalPosition, 4, '') + ']';
      }
      if (positionDeltaPercent > 0) {message += '+';}
      message += '\t(' + accounting.formatNumber(positionDeltaPercent, 2) + '%)';
      console.log(message);
    }
  }

  var btc = 331.0578
    , originalPrice = 912.575
    , gox = new MtGox()
    , oneSecondTimer = null
    , originalPosition = (btc * originalPrice)
    , previousLast = null
    , retrieveMarketDataTask;

  return that;
}
Drone.create = function() {return new Drone();};