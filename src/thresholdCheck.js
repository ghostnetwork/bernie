
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

      if ((data.status === App.Status.InMarket) && (result.deltaLast !== 0)) {
        if (existy(result.previousLast)) {
          if (result.positionDeltaPercent <= data.lossThreshold) {
            console.log('LOSS THRESHOLD -------------------------------------------------- (' 
              + accounting.formatNumber(result.positionDeltaPercent, 4) + ')');
            result.data.status = App.Status.WaitingAfterLoss;
            sell(result);
          }
          else if (result.positionDeltaPercent >= data.gainThreshold) {
            console.log('GAIN THRESHOLD ++++++++++++++++++++++++++++++++++++++++++++++++++ (' 
              + accounting.formatNumber(result.positionDeltaPercent, 4) + ')');
            result.data.status = App.Status.WaitingAfterGain;
            sell(result);
          }
        }
      }
    }

    function sell(result) {
      result.data.cash = result.position;
      result.data.originalPrice = result.market.ask;

      console.log('sold:\n' + util.inspect(result.data));
      PubSub.global.publish(App.Events.UpdateConfig, result.data);
    }

    return that;
  };
  ThresholdCheck.create = function() {return new ThresholdCheck();};
  module.exports = ThresholdCheck;
}).call(this);
