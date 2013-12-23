
(function() {
  'use strict';
  
  require('../lib/verdoux/predicates.js');
  var _ = require('underscore')
    , util = require('util')
    , PubSub = require('../lib/verdoux/pubsub.js')
    , App = require('./app.js')
    , MtGoxService = require('./mtgoxService.js');

  function Calculate(){
    var that = PubSub.create();
    
    that.performCalculations = function(result) {onRetrievedMarketData(result);};

    function onRetrievedMarketData(result) {
      var market = result.market;
      var elapsed = result.elapsed;
      var data = result.data;

      switch (data.status) {
        case App.Status.EnteringMarket:
          result.currentPrice = market.ask;
          data.originalPrice = market.bid;//result.currentPrice;
          result.originalPosition = data.cash;
          data.btc = result.originalPosition / data.originalPrice;
          data.status = App.Status.InMarket;
          break;

        case App.Status.InMarket:
        case App.Status.Waiting:
        case App.Status.Waiting:
          // result.currentPrice = market.last;
          result.currentPrice = market.ask;
          result.originalPosition = data.cash;
          break;

        default:
          result.originalPosition = (data.btc * data.originalPrice);
          break;
      }

      result.previousLast = previousLast;

      result.deltaLast = result.currentPrice - result.previousLast;
      result.deltaPercent = (result.deltaLast / result.currentPrice) * 100;
      result.position = data.btc * result.currentPrice;
      result.positionDelta = result.position - result.originalPosition;
      result.positionDeltaPercent = (result.positionDelta / result.originalPosition) * 100;

      previousLast = result.currentPrice;
    }

    var previousLast = null;

    return that;
  };

  Calculate.create = function() {return new Calculate();};
  module.exports = Calculate;
}).call(this);
