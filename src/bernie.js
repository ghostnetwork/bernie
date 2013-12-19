
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
var accounting = require('accounting')
  , _ = require('underscore')
  , util = require('util')
  , MtGox = require('mtgox')
  , ElapsedTime = require('../lib/verdoux/elapsedTime.js')
  , GameLoop = require('../lib/verdoux/gameloop.js')
  , PubSub = require('../lib/verdoux/pubsub.js')
  , Task = require('../lib/koufax/task.js')
  , Config = require('../lib/verdoux/config.js')
  , Drone = require('../src/drone.js');

function Bernie(options) {
  var that = PubSub.create();

  Object.defineProperty(that, 'options', {get : function() {return _options;},enumerable : true});
  that.drone = Drone.create();

  that.init = function() {retrieveConfigData(); return that;};
  that.start = function() {gameLoop.start(); return that;};
  that.writeConfigData = function(data){ storeConfigData(data); return that;};

  function onGameLoopTick() {that.drone.performWork();};

  function retrieveConfigData() {config.load().on(Config.Events.didLoad, onConfigDataLoad);};
  function onConfigDataLoad() {
    var data = configDataToObject(config.data);
    that.drone.acceptData(data);
  };

  function storeConfigData(data) {
    config.on(Config.Events.didStore, function(dataStored) {
      console.log('storeConfigData: ' + util.inspect(dataStored));
    });
    config.store(data);
  }

  var config = Config.create()
    , gameLoop = GameLoop.create(onGameLoopTick);
  var _options = options;

  return that;
};
Bernie.create = function(options) {return new Bernie(options);};
module.exports = Bernie;
