
(function() {
  'use strict';
  
  require('../lib/verdoux/predicates.js');
  require('../lib/verdoux/dateTimeTools.js');
  var accounting = require('accounting')
    , _ = require('underscore')
    , util = require('util')
    , PubSub = require('../lib/verdoux/pubsub.js')
    , App = require('./app.js')
    , Calculate = require('./calculate.js');

  function Report(){
    var that = PubSub.create();
    that.produceReport = function(result) {logResult(result);};
    return that;
  };

  function logResult(result) {
    var market = result.market;
    var elapsed = result.elapsed;
    var data = result.data;

    if (notExisty(market)) return;

    var dateString = rightNowUTCToString();
    var message = dateString + ' (' + elapsed + 'ms)';
    message += ' : ' + accounting.formatNumber(result.currentPrice, 4);
    message += ' [' + accounting.formatNumber(market.volume, 2, '') + ']';

    if (result.deltaLast !== 0) {
      if (existy(result.previousLast)) {
        // var deltaPercent = (result.deltaLast / result.currentPrice) * 100;
        message += '[' + accounting.formatNumber(result.position, 4, '') + ']';
        message += '[' + accounting.formatNumber(data.btc, 4, '') + ']';

        if (result.deltaPercent >= 0) {message += '(+';}
        else {message += '('}
        message += accounting.formatNumber(result.deltaPercent, 4) + '%)';

        if (data.status !== App.Status.EnteringMarket) {
          if (result.positionDeltaPercent > 0) {message += '(+';}
          else if (result.positionDeltaPercent !== 0) {message += '(';}

          if (result.positionDeltaPercent !== 0) {
            message += accounting.formatNumber(result.positionDeltaPercent, 6);
            message += '%)';
          }
        }
      }
      else {
        message += '[' + accounting.formatNumber(result.position, 4, '') + ']';
        message += '[' + accounting.formatNumber(data.btc, 4, '') + ']';
      }
    }
    else if (data.status !== App.Status.EnteringMarket) {
      var total = data.btc * result.previousLast;
      message += '[' + accounting.formatNumber(total, 4, '') + ']';
      message += '[' + accounting.formatNumber(data.btc, 4, '') + ']';
    }

    message += ' ' + App.Status.statusToString(data.status);

    console.log(message);
  }

  Report.create = function() {return new Report();};
  module.exports = Report;
}).call(this);