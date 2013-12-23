
configDataToObject = function(configData) {
  var obj = JSON.parse(configData);
  var btc = obj['btc'];
  var cash = obj['cash'];
  var originalPrice = obj['originalPrice'];
  var status = obj['status'];
  var lossThreshold = obj['lossThreshold'];
  var gainThreshold = obj['gainThreshold'];
  var enterAfterWaitingThreshold = obj['enterAfterWaitingThreshold'];
  var data = {
    btc:btc, 
    cash:cash, 
    originalPrice:originalPrice, 
    status:status,
    lossThreshold:lossThreshold,
    gainThreshold:gainThreshold,
    enterAfterWaitingThreshold:enterAfterWaitingThreshold
  };
  // console.log('configDataToObject: data: ' + util.inspect(data));
  
  return data;
}

'use strict';

require('../lib/verdoux/predicates.js');
require('../lib/verdoux/dateTimeTools.js');
var _ = require('underscore')
  , accounting = require('accounting')
  , async = require('async')
  , util = require('util')
  , MtGox = require('mtgox')
  , Config = require('../lib/verdoux/config.js')
  , ElapsedTime = require('../lib/verdoux/elapsedTime.js')
  , GameLoop = require('../lib/verdoux/gameloop.js')
  , PubSub = require('../lib/verdoux/pubsub.js')
  , App = require('./app.js')
  , Calculate = require('./calculate.js')
  , MtGoxService = require('./mtgoxService.js')
  , Report = require('./report.js')
  , ThresholdCheck = require('./thresholdCheck.js');

function Bernie(options) {
  var that = PubSub.create();

  Object.defineProperty(that, 'options', {get : function() {return _options;},enumerable : true});
  that.mtgoxService = MtGoxService.create();
  that.calculate = Calculate.create();
  that.report = Report.create();
  that.thresholdCheck = ThresholdCheck.create();

  that.init = function() {retrieveConfigData(); onGameLoopTick(); return that;};
  that.start = function() {gameLoop.start(10 * 1000); return that;};
  that.writeConfigData = function(data){ storeConfigData(data); return that;};

  function onGameLoopTick() {
    async.waterfall(tasks, function(error, results) {
      if (error) {console.error(error);}
    });
  };

  function retrieveMtGoxData(done) {
    that.mtgoxService.performWork(function(result) {
      done(null, result);
      return result;
    });
  };

  function makeCalculations(result, done) {
    that.calculate.performCalculations(result);
    done(null, result);
  };

  function produceReport(result, done) {
    that.report.produceReport(result);
    done(null, result);
  };

  function checkThresholdCrossing(result, done) {
    that.thresholdCheck.performCheck(result);
    done(null, result);
  };

  function retrieveConfigData() {config.load().on(Config.Events.didLoad, onConfigDataLoad);};
  function onConfigDataLoad() {
    var data = configDataToObject(config.data);
    data.status = App.Status.EnteringMarket;
    that.mtgoxService.acceptData(data);
  };

  function storeConfigData(data) {
    config.on(Config.Events.didStore, function(dataStored) {
      // console.log('storeConfigData: ' + util.inspect(dataStored));
    });

    // config.store(data);
    config.store(JSON.stringify(data));
  };

  PubSub.global.on(App.Events.UpdateConfig, storeConfigData);

  var config = Config.create()
    , gameLoop = GameLoop.create(onGameLoopTick)
    , tasks = [retrieveMtGoxData, makeCalculations, produceReport, checkThresholdCrossing];
  var _options = options;

  return that;
};
Bernie.create = function(options) {return new Bernie(options);};
module.exports = Bernie;
