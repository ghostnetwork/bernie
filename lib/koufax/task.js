
(function() {
  'use strict';
  
  require('../verdoux/predicates.js');
  var util = require('util')
    , _ = require('underscore')
    , PubSub = require('../verdoux/pubsub.js');

  function Task(name, worker){
    var that = PubSub.create();

    Object.defineProperty(that, 'name', {get : function() {return _name;},enumerable : true});
    Object.defineProperty(that, 'worker', {get : function() {return _worker;},enumerable : true});

    that.begin = function() {
      state = Task.States.PerformingWork;

      that.publish(Task.Events.BeginWork, {task:that});
      worker(publishDone);
    };

    function publishDone(result) {
      state = Task.States.Done;
      that.publish(Task.Events.Done, {task:that, value:result});
    };

    that.markCompleted = function() {
      state = Task.States.Completed;
      that.publish(Task.Events.MarkedCompleted, {task:that});
    };

    that.reset = function() {state = Task.States.Ready;};

    that.currentState = function() {return taskStateToString(state);};

    that.isReady = function() {return state === Task.States.Ready;};
    that.isPerformingWork = function() {return state === Task.States.PerformingWork;};
    that.isDone = function() {return state === Task.States.Done;};
    that.isCompleted = function() {return state === Task.States.Completed;};
    that.isStateUnknown = function() {return state === Task.States.StateUnknown;};

    var state = Task.States.Ready;
    var _name = name
      , _worker = worker;
    return that;
  };
  Task.create = function(name, worker) {return new Task(name, worker);};

  Task.States = {
    StateUnknown    : 0,
    Ready           : 1,
    PerformingWork  : 2,
    Done            : 3,
    Completed       : 100
  };
  function taskStateToString(state) { 
    var result = '';
    switch(state) {
      case Task.States.Ready: result = 'Ready'; break;
      case Task.States.PerformingWork: result = 'PerformingWork'; break;
      case Task.States.Done: result = 'Done'; break;
      case Task.States.Completed: result = 'Completed'; break;

      case Task.States.StateUnknown: 
      default:
        result = 'StateUnknown'; break;
    }
    return result;
  };

  Task.Events = {
    Ready             : 'Task.Events.Ready',          // @param: {task};
    BeginWork         : 'Task.Events.BeginWork',      // @param: {task};
    isDone            : 'Task.Events.Done',           // @param: {task; value: value returned by worker()}
    MarkedCompleted   : 'Task.Events.MarkedCompleted' // @param: {task};
  };

  module.exports = Task;
}).call(this);