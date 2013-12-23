
configDataToObject = function(configData) {
  var obj = JSON.parse(configData);
  var btc = obj['btc'];
  var cash = obj['cash'];
  var originalPrice = obj['originalPrice'];
  var status = obj['status'];
  var lossThreshold = obj['lossThreshold'];
  var gainThreshold = obj['gainThreshold'];
  var data = {
    btc:btc, 
    cash:cash, 
    originalPrice:originalPrice, 
    status:status,
    lossThreshold:lossThreshold,
    gainThreshold:gainThreshold
  };
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
  , ThresholdCheck = require('../src/thresholdCheck.js')
  , Calculate = require('../src/calculate.js')
  , MtGoxService = require('../src/mtgoxService.js')
  , Report = require('../src/report.js');

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
    that.mtgoxService.acceptData(data);
  };

  function storeConfigData(data) {
    config.on(Config.Events.didStore, function(dataStored) {
      console.log('storeConfigData: ' + util.inspect(dataStored));
    });
    config.store(data);
  };

  var config = Config.create()
    , gameLoop = GameLoop.create(onGameLoopTick)
    , tasks = [retrieveMtGoxData, makeCalculations, produceReport, checkThresholdCrossing];
  var _options = options;

  return that;
};
Bernie.create = function(options) {return new Bernie(options);};
module.exports = Bernie;
