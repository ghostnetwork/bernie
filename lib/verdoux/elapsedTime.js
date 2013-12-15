
(function() {
  'use strict';
  
  var util = require('util')
    , PubSub = require('./pubsub.js');

  function ElapsedTime(){
    var that = PubSub.create();
  
    Object.defineProperty(that, 'startTime', {get : function() {
      return _startTime;},enumerable : true
    });
    Object.defineProperty(that, 'endTime', {get : function() {
      return _endTime;},enumerable : true
    });
    Object.defineProperty(that, 'elapsedTime', {get : function() {
      return _elapsedTime;},enumerable : true
    });

    that.start = function(){_startTime = Date.now(); return that;};

    that.stop = function() {
      _endTime = Date.now();
      _elapsedTime = (that.endTime - that.startTime);
    };

    var _startTime
      , _endTime
      , _elapsedTime;

    return that;
  };

  ElapsedTime.create = function() {return new ElapsedTime();};

  module.exports = ElapsedTime;

}).call(this);
