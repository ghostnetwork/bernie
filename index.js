'use strict';

require('./lib/verdoux/predicates.js');
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('./lib/verdoux/elapsedTime.js')
  , GameLoop = require('./lib/verdoux/gameloop.js')
  , PubSub = require('./lib/verdoux/pubsub.js');

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
      oneSecondTimer = setInterval(task, 10 * 1000);
      task();
    }
  };

  function task() {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      logResult({market:market}, timestamp);
      previousLast = market.last;
    });
  }

  function logResult(result, timestamp) {
    var market = result.market;
    var now = Date.now();
    var elapsed = now - timestamp;
    var position = btc * market.last;
    var delta = market.last - previousLast;
    var positionDelta = position - originalPosition;
    var positionDeltaPercent = (positionDelta / originalPosition) * 100;


    if (delta !== 0) {
      var message = new Date().toString() + ' in ' + elapsed + 'ms';
      message += ' : ' + market.last;

      if (existy(previousLast)) {
        var deltaPercent = (delta / market.last);
        message += '\t(' + accounting.formatNumber(deltaPercent, 2) + '%)';
      }
      else {
        message += '\t';
      }
      message += '\t[' + accounting.formatNumber(position, 4, '') + ']';
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
    , previousLast = null;

  return that;
}
Drone.create = function() {return new Drone();};