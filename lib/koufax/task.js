
(function() {
  'use strict';
  
  require('../verdoux/predicates.js');
  var util = require('util')
    , _ = require('underscore')
    , PubSub = require('../verdoux/pubsub.js');

  function Task(worker){
    var that = PubSub.create();

    Object.defineProperty(that, 'worker', {get : function() {return _worker;},enumerable : true});

    that.begin = function() {
      state = Task.States.PerformingWork;

      that.publish(Task.Events.BeginWork, {task:that});
      var result = worker();
      that.publish(Task.Events.EndWork, {task:that, result:result});
    };

    that.markCompleted = function() {
      state = Task.states.Completed;
      that.publish(Task.Events.Completed, {task:that});
    }

    var state = Task.States.Ready;
    var _worker = worker;
    return that;
  };
  Task.create = function(worker) {return new Task(worker);};

  Task.States = {
    StateUnknown    : 0,
    Ready           : 1,
    PerformingWork  : 2,
    Done            : 3,
    Completed       : 100
  };

  Task.Events = {
    Ready             : 'Task.Events.Ready',          // @param: {task};
    BeginWork         : 'Task.Events.BeginWork',      // @param: {task};
    EndWork           : 'Task.Events.EndWork',        // @param: {task; result: value returned by worker()}
    MarkedCompleted   : 'Task.Events.MarkedCompleted' // @param: {task};
  };

  module.exports = Task;
}).call(this);