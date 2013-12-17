'use strict';

require('./lib/verdoux/predicates.js');
require('./lib/verdoux/dateTimeTools.js');
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('./lib/verdoux/elapsedTime.js')
  , GameLoop = require('./lib/verdoux/gameloop.js')
  , PubSub = require('./lib/verdoux/pubsub.js')
  , Task = require('./lib/koufax/task.js')
  , Config = require('./lib/verdoux/config.js')
  , config = Config.create();

function Bernie(options) {
  var that = PubSub.create();

  Object.defineProperty(that, 'options', {get : function() {return _options;},enumerable : true});

  that.init = function() {
    config.load()
          .on(Config.Events.didLoad, function() {
            var obj = JSON.parse(config.data);
            var btc = obj['btc'];
            var cash = obj['cash'];
            var originalPrice = obj['originalPrice'];
            var status = obj['status'];
            var data = {
              btc:btc, 
              cash:cash, 
              originalPrice:originalPrice, 
              status:status
            };
            that.drone.acceptData(data);

            // var newData = {"btc":100, "originalPrice":666};
            // var dataJSON = JSON.stringify(newData);
            // console.log('\n\ndataJSON: ' + util.inspect(dataJSON));

            // config.store(dataJSON);
          });
  };

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

  that.acceptData = function(data) {
    btc = data.btc;
    cash = data.cash;
    originalPrice = data.originalPrice;
    status = data.status;
    console.log('data: ' + util.inspect(data));
  };

  that.performWork = function(){
    if (notExisty(oneSecondTimer))  {
      if (notExisty(retrieveMarketDataTask)) {
        retrieveMarketDataTask = Task.create('market', retrieveMarketData);
        retrieveMarketDataTask.on(Task.Events.Done, onMarketDone);
        retrieveMarketDataTask.on(Task.Events.MarkedCompleted, onMarketCompleted);
      }
      oneSecondTimer = setInterval(onTimerTrigger, 10 * 1000);
      onTimerTrigger();
    }
  };

  function onTimerTrigger() {
    if (retrieveMarketDataTask.isReady()) {
      retrieveMarketDataTask.begin();
    }
  };

  function onMarketDone(result) {
    logResult({market:result.value.market}, result.value.timestamp);
    retrieveMarketDataTask.markCompleted();
  };

  function onMarketCompleted() {retrieveMarketDataTask.reset();};

  function retrieveMarketData(done) {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      done({market:market, timestamp:timestamp});
      previousLast = market.last;
    });
  };

  function logResult(result, timestamp) {
    var market = result.market;

    var now = Date.now();
    var elapsed = now - timestamp;
    
    var originalPosition = 0;
    if (status === 0) {
      originalPrice = market.last;
      originalPosition = cash;
    }
    else {
      originalPosition = (btc * originalPrice);
    }

    var position = btc * market.last;
    var delta = market.last - previousLast;
    var positionDelta = position - originalPosition;
    var positionDeltaPercent = (positionDelta / originalPosition) * 100;

    if (delta !== 0) {
      var dateString = rightNowUTCToString();
      var message = dateString + ' (' + elapsed + 'ms)';
      message += ' : ' + accounting.formatNumber(market.last, 4);
      message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

      if (existy(previousLast)) {
        var deltaPercent = (delta / market.last) * 100;
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        if (deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(deltaPercent, 4) + '%)\t';
      }
      else {
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        message += '[' + accounting.formatNumber(originalPosition, 4, '') + ']';
      }
      if (status !== 0) {
        if (positionDeltaPercent > 0) {message += '\t(+';}
        else {message += '\t('}
        message += accounting.formatNumber(positionDeltaPercent, 2) + '%)';
      }
      console.log(message);
    }
  }

  function rightNowUTCToString() {
    var now = new Date();
    var utcDay = now.getUTCDay();
    var utcMonth = now.getUTCMonth();
    var utcDate = now.getUTCDate();
    var utcYear = now.getFullYear();
    var utcHours = now.getUTCHours();
    var utcMins = now.getUTCMinutes();
    var utcSecs = now.getUTCSeconds();
    var utcMillis = now.getUTCMilliseconds();
    
    var day = dayToShortString(utcDay);
    var month = monthToShortString(utcMonth);
    var result = day + ' ' 
               + month + ' ' 
               + padWithZeros(utcDate.toString(), 2) + ' ' 
               + utcYear + ' ' 
               + padWithZeros(utcHours.toString(), 2) + ':' 
               + padWithZeros(utcMins.toString(), 2) + ':' 
               + padWithZeros(utcSecs.toString(), 2) + ':' 
               + padWithZeros(utcMillis.toString(), 3);
    return result;
  }

  var btc = 0
    , originalPrice = 0
    , status = 0
    , cash = 0
    , gox = new MtGox()
    , oneSecondTimer = null
    , previousLast = null
    , retrieveMarketDataTask;

  return that;
}
Drone.create = function() {return new Drone();};