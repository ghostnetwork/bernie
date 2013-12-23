
(function() {
  'use strict';
  
  var _ = require('underscore')
    , accounting = require('accounting')
    , util = require('util')
    , PubSub = require('../lib/verdoux/pubsub.js')
    , App = require('./app.js');

  function ThresholdCheck(){
    var that = PubSub.create();

    that.performCheck = function(result) {
      var data = result.data;
      
      // console.log('performCheck:\n' + util.inspect(result));

      if (data.status === App.Status.InMarket) {
        if (result.deltaLast !== 0) {
          if (existy(result.previousLast)) {
            if (result.positionDeltaPercent <= data.lossThreshold) {
              console.log('LOSS THRESHOLD -------------------------------------------------- (' 
                + accounting.formatNumber(result.positionDeltaPercent, 4) + ')');
              result.data.status = App.Status.Waiting;
              sell(result);
            }
            else if (result.positionDeltaPercent >= data.gainThreshold) {
              console.log('GAIN THRESHOLD ++++++++++++++++++++++++++++++++++++++++++++++++++ (' 
                + accounting.formatNumber(result.positionDeltaPercent, 4) + ')');
              result.data.status = App.Status.Waiting;
              sell(result);
            }
          }
        }
      }
      else if (data.status === App.Status.Waiting) {
        if ((result.positionDeltaPercent <= data.enterAfterWaitingThreshold)
         || (result.deltaPercent <= data.enterAfterWaitingThreshold)) {
          console.log('RE-ENTERING MARKET $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
          result.data.status = App.Status.EnteringMarket;
        }
      }
    }

    function sell(result) {
      result.data.cash = result.position;
      result.data.originalPrice = result.market.ask;
      result.data.btc = result.data.cash / result.data.originalPrice;

      // console.log('sold:\n' + util.inspect(result.data));
      var message = 'sold:\n  '; 
         message += accounting.formatNumber(result.data.btc, 4) + '\n  ';
         message += accounting.formatNumber(result.data.cash, 4) + '\n  ';
         message += accounting.formatNumber(result.data.originalPrice, 4);
      console.log(message);

      PubSub.global.publish(App.Events.UpdateConfig, result.data);
    }

    return that;
  };
  ThresholdCheck.create = function() {return new ThresholdCheck();};
  module.exports = ThresholdCheck;
}).call(this);
