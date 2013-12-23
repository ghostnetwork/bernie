
var util = require('util')
  , _ = require('underscore')
  , PubSub = require('../verdoux/pubsub.js')
  , Pulse = require('../verdoux/pulse.js');

function GameLoop(callback) {
  var that = PubSub.create();

  that.start = function(interval) {
    if (typeof interval == 'undefined') {interval = 20;}
    pulse.addObserver(_callback);
    pulse.start(interval);
  }

  that.stop = function() {
    console.log('GameLoop.stop');
    pulse.removeObserver(_callback);
    pulse.stop();
  }

  var pulse = Pulse.create();
  var _callback = callback;

  return that;
}

GameLoop.create = function(callback) {return new GameLoop(callback);};

module.exports = GameLoop;
