require('../lib/verdoux/predicates.js');
require('../lib/verdoux/dateTimeTools.js');
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('../lib/verdoux/elapsedTime.js')
  , GameLoop = require('../lib/verdoux/gameloop.js')
  , PubSub = require('../lib/verdoux/pubsub.js');

function MtGoxService() {
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

  that.performWork = function(completion){
    retrieveMarketData(function(result) {
      result.elapsed = Date.now() - result.timestamp;
      result.data = _data;
      completion(result);
    });
  };

  function retrieveMarketData(done) {
    var timestamp = Date.now();
    gox.market('BTCUSD', function(err, market) {
      if (typeof market != 'undefined') {
        // console.log('market ========== \n' + util.inspect(market));
        done({market:market, timestamp:timestamp});
      }
    });
  };

  var _data = {}
    , gox = new MtGox();

  return that;
}
MtGoxService.create = function() {return new MtGoxService();};
module.exports = MtGoxService;
