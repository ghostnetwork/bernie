
(function() {
  'use strict';
  
  var _ = require('underscore');
  var util = require('util');
  var PubSub = require('../lib/verdoux/pubsub.js');

  function ThresholdCheck(){
    var that = PubSub.create();

    that.performCheck = function(result) {
      var data = result.data;
      
      if (result.deltaLast !== 0) {
        if (existy(result.previousLast)) {
          if (result.positionDeltaPercent <= data.lossThreshold) {
            if (data.status !== -1) {
              console.log('-------------------------------------------------- LOSS THRESHOLD (' 
                + result.positionDeltaPercent + ')');
              // that.sell(market);
            }
          }
          else if (result.positionDeltaPercent >= data.gainThreshold) {
            if (data.status !== -1) {
              console.log('++++++++++++++++++++++++++++++++++++++++++++++++++ GAIN THRESHOLD (' 
                + result.positionDeltaPercent + ')');
              // that.sell(market);
            }
          }
        }
      }
    }

    return that;
  };
  ThresholdCheck.create = function() {return new ThresholdCheck();};
  module.exports = ThresholdCheck;
}).call(this);
