
(function() {
  'use strict';
  
  require('../lib/verdoux/predicates.js');
  var _ = require('underscore')
    , util = require('util')
    , PubSub = require('../lib/verdoux/pubsub.js')
    , Drone = require('./drone.js');

  function Calculate(){
    var that = PubSub.create();
    
    PubSub.global.on(Drone.Events.DidRetrieveMarketData, onRetrievedMarketData);

    function onRetrievedMarketData(result) {
      var market = result.market;
      var elapsed = result.elapsed;
      var data = result.data;

// console.log('onRetrievedMarketData -------------------------------');
// console.log('result: ' + util.inspect(result));
// console.log('market: ' + util.inspect(market));
// console.log('elapsed: ' + util.inspect(elapsed));
// console.log('data: ' + util.inspect(data));

      if (data.status === 0) {
        result.currentPrice = market.bid;
        data.originalPrice = result.currentPrice;
        result.originalPosition = data.cash;
        data.btc = result.originalPosition / data.originalPrice;
        data.status = 1;

        // console.log('-->    originalPrice: ' + data.originalPrice);
        // console.log('--> originalPosition: ' + originalPosition);
        // console.log('-->              btc: ' + data.btc);
        // console.log('-->           status: ' + data.status);
      }
      else if (data.status === 1) {
        result.currentPrice = market.last;
        result.originalPosition = data.cash;
      }
      else if (data.status === -1) {
        result.currentPrice = market.last;
        result.originalPosition = data.cash;
        // console.log('on the sidelines for now:\n' 
        //   + '           btc: ' + data.btc + '\n'
        //   + '          cash: ' + accounting.formatNumber(data.cash, 4) + '\n'
        //   + '  previousLast: '  + previousLast + '\n'
        //   + '         total: ' + (data.cash + total) + '\n'
        //   + '   market.last: ' + market.last);
      }
      else {
        result.originalPosition = (data.btc * data.originalPrice);
      }

      result.previousLast = previousLast;
      PubSub.global.publish(Calculate.Events.DidCalculateResults, result);
      previousLast = result.currentPrice;
    }

    var previousLast = null;

    return that;
  };

  Calculate.create = function() {return new Calculate();};
  Calculate.Events = {
    DidCalculateResults: 'did.calculate.results'  // @param: results
  };
  module.exports = Calculate;
}).call(this);
