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

  function onTimerTrigger() {
    if (retrieveMarketDataTask.isReady()) {
      retrieveMarketDataTask.begin();
    }
  };

  function onRetrieveMarketDataDone(result) {
    result.value.elapsed = Date.now() - result.value.timestamp;
    result.value.data = _data;
    PubSub.global.publish(Drone.Events.DidRetrieveMarketData, result.value);

    retrieveMarketDataTask.markCompleted();
  };

  function onMarketCompleted() {retrieveMarketDataTask.reset();};

  function retrieveMarketData(done) {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      if (typeof market != 'undefined') {
        done({market:market, timestamp:timestamp});
      }
    });
  };

  var _data = {}
    , gox = new MtGox()
    , oneSecondTimer = null
    , retrieveMarketDataTask;

  return that;
}
Drone.create = function() {return new Drone();};
Drone.Events = {
  DidRetrieveMarketData: 'did.retrieve.market.data'
};
module.exports = Drone;
