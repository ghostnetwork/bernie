
(function() {
  'use strict';
  
  var _ = require('underscore')
    , util = require('util')
    , Calculate = require('./calculate.js')
    , PubSub = require('../lib/verdoux/pubsub.js');

  function ThresholdCheck(){
    var that = PubSub.create();
    PubSub.global.on(Calculate.Events.DidCalculateResults, onDidCalculateResults);

    function onDidCalculateResults(result) {
      // console.log('result: ' + util.inspect(result));

      if (result.originalStatus !== 0) {
        if (result.deltaLast !== 0) {
          if (result.positionDeltaPercent <= result.data.lossThreshold) {
            if (result.data.status !== -1) {
              console.log('-------------------------------------------------- LOSS THRESHOLD (' 
                + result.positionDeltaPercent + ') ---');
              PubSub.global.publish(ThresholdCheck.Events.LossThresholdCrossed, result);
            }
          }
          else if (result.positionDeltaPercent >= result.data.gainThreshold) {
            if (result.data.status !== -1) {
              console.log('++++++++++++++++++++++++++++++++++++++++++++++++++ GAIN THRESHOLD (' 
                + result.positionDeltaPercent + ') +++');
              PubSub.global.publish(ThresholdCheck.Events.GainThresholdCrossed, result);
            }
          }
        }
      }
      console.log('\n--> publishing DidCheckThreshold');
      PubSub.global.publish(ThresholdCheck.Events.DidCheckThreshold, result);
    }
    return that;
  };

  ThresholdCheck.create = function() {return new ThresholdCheck();};
  ThresholdCheck.Events = {
    // @global
    DidCheckThreshold: 'did.check.threshold',         // @param: result
    LossThresholdCrossed: 'loss.threshold.crossed',   // @param: result
    GainThresholdCrossed: 'gain.threshold.crossed'    // @param: result
  };
  module.exports = ThresholdCheck;

}).call(this);
