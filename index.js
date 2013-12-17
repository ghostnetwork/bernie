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
  that.drone = Drone.create();

  that.drone.on(Drone.Events.LossThreshold, function(data) {
    console.log('onLossThreshold: ' + data);
  });
  that.drone.on(Drone.Events.GainThreshold, function(data) {
    console.log('onGainThreshold: ' + data);
  });

  that.init = function() {retrieveConfigData(); return that;};
  that.start = function() {gameLoop.start(); return that;};
  that.writeConfigData = function(data){ storeConfigData(data); return that;};

  function onGameLoopTick() {that.drone.performWork();};

  function retrieveConfigData() {config.load().on(Config.Events.didLoad, onConfigDataLoad);};
  function onConfigDataLoad() {
    var obj = JSON.parse(config.data);
    var btc = obj['btc'];
    var cash = obj['cash'];
    var originalPrice = obj['originalPrice'];
    var status = obj['status'];
    var lossThreshold = obj['lossThreshold'];
    var gainThreshold = obj['gainThreshold'];
    var data = {
      btc:btc, 
      cash:cash, 
      originalPrice:originalPrice, 
      status:status,
      lossThreshold:lossThreshold,
      gainThreshold:gainThreshold
    };
    that.drone.acceptData(data);
  };

  function storeConfigData(data) {
    config.on(Config.Events.didStore, function(dataStored) {
      console.log('storeConfigData: ' + util.inspect(dataStored));
    });
    config.store(data);
  }

  var gameLoop = GameLoop.create(onGameLoopTick);
  var _options = options;

  return that;
};
Bernie.create = function(options) {return new Bernie(options);};
module.exports = Bernie;

function Drone() {
  var that = PubSub.create();

  that.acceptData = function(data) {
    _data.btc = data.btc;
    _data.cash = data.cash;
    _data.originalPrice = data.originalPrice;
    _data.status = data.status;
    _data.lossThreshold = data.lossThreshold;
    _data.gainThreshold = data.gainThreshold;
    // console.log('_data.: ' + util.inspect(_data));
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

    if (notExisty(market)) return;

    var now = Date.now();
    var elapsed = now - timestamp;
    
    var originalPosition = 0;
    if (_data.status === 0) {
      _data.originalPrice = market.last;
      originalPosition = _data.cash;
      _data.btc = originalPosition / _data.originalPrice;
      _data.status = 1;
      // console.log('-->    originalPrice: ' + _data.originalPrice);
      // console.log('--> originalPosition: ' + originalPosition);
      // console.log('-->              btc: ' + _data.btc);
      // console.log('-->           status: ' + _data.status);
    }
    else {
      originalPosition = (_data.btc * _data.originalPrice);
    }

    var position = _data.btc * market.last;
    var deltaLast = market.last - previousLast;
    var positionDelta = position - originalPosition;
    var positionDeltaPercent = (positionDelta / originalPosition) * 100;

    if (deltaLast !== 0) {
      var dateString = rightNowUTCToString();
      var message = dateString + ' (' + elapsed + 'ms)';
      message += ' : ' + accounting.formatNumber(market.last, 4);
      message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

      if (existy(previousLast)) {
        var deltaPercent = (deltaLast / market.last) * 100;
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        if (deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(deltaPercent, 4) + '%)';

        if (positionDeltaPercent <= _data.lossThreshold) {
          console.log('-------------------------------------------------- LOSS THRESHOLD (' 
            + positionDeltaPercent + ')');
          that.publish(Drone.Events.LossThreshold, _data);
        }
        else if (positionDeltaPercent >= _data.gainThreshold) {
          console.log('++++++++++++++++++++++++++++++++++++++++++++++++++ GAIN THRESHOLD (' 
            + positionDeltaPercent + ')');
          that.publish(Drone.Events.GainThreshold, _data);
        }
      }
      else {
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        message += '[' + accounting.formatNumber(originalPosition, 4, '') + ']';
      }
      if (_data.status !== 0) {
        if (positionDeltaPercent > 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(positionDeltaPercent, 4) + '%)';
      }
      console.log(message);
    }
  }

  // TODO: Move to verdoux/dateTimeTools.js
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

  var _data = {}
    , gox = new MtGox()
    , oneSecondTimer = null
    , previousLast = null
    , retrieveMarketDataTask;

  return that;
}
Drone.create = function() {return new Drone();};
Drone.Events = {
  LossThreshold : 'Loss.Threshold',
  GainThreshold : 'Gain.Threshold'
};