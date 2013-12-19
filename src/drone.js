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

  Object.defineProperty(that, 'data', {get : function() {return _data;},enumerable : true});

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
        retrieveMarketDataTask.on(Task.Events.Done, onRetrieveMarketDataDone);
        retrieveMarketDataTask.on(Task.Events.MarkedCompleted, onMarketCompleted);
      }
      oneSecondTimer = setInterval(onTimerTrigger, 10 * 1000);
      onTimerTrigger();
    }
  };

  that.sell = function(market) {
    var value = _data.btc / market.ask;

    console.log('sell: market: ' + util.inspect(market));
    console.log('value (cash): ' + value);
    _data.cash = value;
    _data.status = -1;
    console.log('_data: ' + util.inspect(_data));
  }

  that.buy = function(market) {
  }

  function onTimerTrigger() {
    if (retrieveMarketDataTask.isReady()) {
      retrieveMarketDataTask.begin();
    }
  };

  function onRetrieveMarketDataDone(result) {

    console.log('result.value: ' + util.inspect(result.value));
    
    logResult({market:result.value.market}, result.value.timestamp);
    retrieveMarketDataTask.markCompleted();
  };

  function onMarketCompleted() {retrieveMarketDataTask.reset();};

  that.dispatch = function() {
    console.log('_data: ' + util.inspect(_data));
  };

  that.calculateMarketChanges = function(market) {
    if (notExisty(market)) return;
  };

  function retrieveMarketData(done) {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      if (typeof market != 'undefined') {
        done({market:market, timestamp:timestamp});
        previousLast = currentPrice;
      }
    });
  };

  function logResult(result, timestamp) {
    var market = result.market;

console.log('market.last: ' + util.inspect(market.last));

    if (notExisty(market)) return;

    var now = Date.now();
    var elapsed = now - timestamp;
    
    if (_data.status === 0) {
      currentPrice = market.bid;
      _data.originalPrice = currentPrice;
      originalPosition = _data.cash;
      _data.btc = originalPosition / _data.originalPrice;
      _data.status = 1;

      // console.log('-->    originalPrice: ' + _data.originalPrice);
      // console.log('--> originalPosition: ' + originalPosition);
      // console.log('-->              btc: ' + _data.btc);
      // console.log('-->           status: ' + _data.status);
    }
    else if (_data.status === 1) {
      currentPrice = market.last;
    }
    else if (_data.status === -1) {
      var total = _data.btc * previousLast;
      console.log('on the sidelines for now:\n' 
        + '           btc: ' + _data.btc + '\n'
        + '          cash: ' + _data.cash + '\n'
        + '  previousLast: '  + previousLast + '\n'
        + '         total: ' + (_data.cash + total) + '\n'
        + '  currentPrice: '  + currentPrice + '\n'
        + '   market.last: ' + market.last);
      currentPrice = market.last;
    }
    else {
      originalPosition = (_data.btc * _data.originalPrice);
    }

    var position = _data.btc * currentPrice;
    var deltaLast = currentPrice - previousLast;
    var positionDelta = position - originalPosition;
    var positionDeltaPercent = (positionDelta / originalPosition) * 100;

    console.log('            position: ' + position);
    console.log('           deltaLast: ' + deltaLast);
    console.log('        currentPrice: ' + currentPrice);
    console.log('       originalPrice: ' + _data.originalPrice);
    console.log('       positionDelta: ' + positionDelta);
    console.log('positionDeltaPercent: ' + positionDeltaPercent);

    if (deltaLast !== 0) {
      var dateString = rightNowUTCToString();
      var message = dateString + ' (' + elapsed + 'ms)';
      message += ' : ' + accounting.formatNumber(currentPrice, 4);
      message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

      if (existy(previousLast)) {
        var deltaPercent = (deltaLast / currentPrice) * 100;
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        if (deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(deltaPercent, 4) + '%)';

        if (positionDeltaPercent <= _data.lossThreshold) {
          if (_data.status !== -1) {
            console.log('-------------------------------------------------- LOSS THRESHOLD (' 
              + positionDeltaPercent + ')');
            that.sell(market);
          }
        }
        else if (positionDeltaPercent >= _data.gainThreshold) {
          if (_data.status !== -1) {
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++ GAIN THRESHOLD (' 
              + positionDeltaPercent + ')');
            that.sell(market);
          }
        }
      }
      else {
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        message += '[' + accounting.formatNumber(_data.btc, 4, '') + ']';
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
    , originalPosition = 0
    , currentPrice = 0.0
    , retrieveMarketDataTask;

  return that;
}
Drone.create = function() {return new Drone();};
module.exports = Drone;
