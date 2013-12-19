
(function() {
  'use strict';
  
  require('../lib/verdoux/predicates.js');
  require('../lib/verdoux/dateTimeTools.js');
  var accounting = require('accounting')
    , _ = require('underscore')
    , util = require('util')
    , PubSub = require('../lib/verdoux/pubsub.js')
    , Calculate = require('./calculate.js');

  function Report(){
    var that = PubSub.create();
    that.report = function(result) {logResult(result);};
    PubSub.global.on(Calculate.Events.DidCalculateResults, that.report);
    return that;
  };

  function logResult(result) {
    var market = result.market;
    var elapsed = result.elapsed;
    var data = result.data;

    if (notExisty(market)) return;

    var now = Date.now();

    var dateString = rightNowUTCToString();
    var message = dateString + ' (' + elapsed + 'ms)';
    message += ' : ' + accounting.formatNumber(result.currentPrice, 4);
    message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

    var position = data.btc * result.currentPrice;
    var deltaLast = result.currentPrice - result.previousLast;
    var positionDelta = position - result.originalPosition;
    var positionDeltaPercent = (positionDelta / result.originalPosition) * 100;

    console.log('        previousLast: ' + result.previousLast);
    console.log('           deltaLast: ' + deltaLast);
    console.log('positionDeltaPercent: ' + positionDeltaPercent);
    console.log('    originalPosition: ' + result.originalPosition);

    if (deltaLast !== 0) {
      if (existy(result.previousLast)) {
        var deltaPercent = (deltaLast / result.currentPrice) * 100;
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        if (deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(deltaPercent, 4) + '%)';

        if (positionDeltaPercent <= data.lossThreshold) {
          if (data.status !== -1) {
            console.log('-------------------------------------------------- LOSS THRESHOLD (' 
              + positionDeltaPercent + ')');
            // that.sell(market);
          }
        }
        else if (positionDeltaPercent >= data.gainThreshold) {
          if (data.status !== -1) {
            console.log('++++++++++++++++++++++++++++++++++++++++++++++++++ GAIN THRESHOLD (' 
              + positionDeltaPercent + ')');
            // that.sell(market);
          }
        }
      }
      else {
        message += '[' + accounting.formatNumber(position, 4, '') + ']';
        message += '[' + accounting.formatNumber(data.btc, 4, '') + ']';
      }
      if (data.status !== 0) {
        if (positionDeltaPercent > 0) {
          message += '(+';
        }
        else if (positionDeltaPercent < 0.0) {
          message += '(';
        }

        if (positionDeltaPercent !== 0) {
          message += accounting.formatNumber(positionDeltaPercent, 4);
          message += '%)';
        }
      }
    }
    else if (data.status === -1) {
      var total = data.btc * result.previousLast;
      message += '[' + accounting.formatNumber(total, 4, '') + ']';
      message += '[B' + accounting.formatNumber(data.btc, 4, '') + ']*';
    }

    console.log(message);
  }

  Report.create = function() {return new Report();};
  module.exports = Report;
}).call(this);