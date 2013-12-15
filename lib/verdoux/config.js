
(function() {
  'use strict';
  
  var util = require('util')
    , fs = require('fs')
    , PubSub = require('./pubsub.js')
    , kConfigFilename = './data/config.json';

  function Config(){
    var that = PubSub.create();

    Object.defineProperty(that, 'data', {get : function() {
      return _data;},enumerable : true
    });

    that.load = function() {
      fs.readFile(kConfigFilename, 'utf-8', function(error, data) {
        if (error) throw error;
        that.publish(Config.Events.didLoad, data);
      });
      return that;
    };

    that.on(Config.Events.didLoad, function(data) {_data = data;});

    var _data;

    return that;
  };

  Config.create = function() {return new Config();};
  Config.Events = {
    get didLoad(){return 'didLoad';}
  }
  module.exports = Config;

}).call(this);
