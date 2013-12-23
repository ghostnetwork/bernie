
(function() {
  'use strict';
  
  require('../verdoux/predicates');
  var _ = require('underscore')
    , util = require('util')
    , Task = require('./task.js')
    , PubSub = require('../verdoux/pubsub.js');

  function Async(tasks){
    var that = PubSub.create();
    
    Object.defineProperty(that, 'tasks', {get : function() {return _tasks;},enumerable : true});

    that.serial = function() {
      _tasks.forEach(function(task) {task.on(Task.Events.Done, onTaskDone);});
      _.first(_tasks).begin();
    }

    function onTaskDone(result) {
      result.task.off(Task.Events.Done, onTaskDone);

      var index = _tasks.indexOf(result.task);
      var numTasks = _tasks.length;

      if (index >= 0) {
        var next = ++index;
        if (next < numTasks) {_tasks[next].begin();}
      }
    };

    var _tasks = tasks;
    return that;
  };
  Async.create = function(tasks) {return new Async(tasks);};

  module.exports = Async;

}).call(this);
