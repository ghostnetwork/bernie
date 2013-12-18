require('../lib/verdoux/predicates.js');
require('../lib/verdoux/dateTimeTools.js');
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('../lib/verdoux/elapsedTime.js')
  , GameLoop = require('../lib/verdoux/gameloop.js')
  , PubSub = require('../lib/verdoux/pubsub.js')
  , Task = require('../lib/koufax/task.js')

function Drone() {
  var that = PubSub.create();

  that.acceptData = function(data) {
    _data.btc = data.btc;
    _data.cash = data.cash;
    _data.originalPrice = data.originalPrice;
    _data.status = data.status;
    _data.lossThreshold = data.lossThreshold;
    _data.gainThreshold = data.gainThreshold;
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
module.exports = Drone;
