
(function() {
  'use strict';
  
  require('../verdoux/predicates');
  var _ = require('underscore')
    , util = require('util')
    , Task = require('./task.js')
    , PubSub = require('../verdoux/pubsub.js');

  function Async(){
    var that = PubSub.create();

    that.serial = function(tasks) {
      serialTasks = tasks;
      serialTasks.forEach(function(task) {task.on(Task.Events.Done, onTaskDone);});
      _.first(tasks).begin();
    }

    function onTaskDone(result) {
      var index = serialTasks.indexOf(result.task);
      var numTasks = serialTasks.length;

      if (index >= 0) {
        var next = ++index;
        if (next < numTasks) {serialTasks[next].begin();}
      }
    };

    var serialTasks = null;
    return that;
  };
  Async.create = function() {return new Async();};

  module.exports = Async;

}).call(this);
