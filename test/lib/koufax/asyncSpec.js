var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var Async = require('../../../lib/koufax/async.js');
var Task = require('../../../lib/koufax/task.js');
require('../../../lib/verdoux/predicates.js');

describe('Async', function(){
  'use strict';

  var async
    , numCompletions;

  beforeEach(function() {async = Async.create(); numCompletions = 0;});

  it('should be able to be created', function(){assert(existy(async));});
  
  describe('serial', function(){
    it('should xxxxx', function(done){
      var numTasks = 3;
      async.serial(createTasks(numTasks, done));
    });
  });

  function createTasks(numTasksToCreate, done) {
    var tasks = [];
    for (var i = 0; i < numTasksToCreate; i++) {
      var name = 'Async.Spec.Task.' + i;
      var worker = function(done) {done(name);};
      var task = Task.create(name, worker);
      task.on(Task.Events.Done, function(payload) {
        if (++numCompletions >= numTasksToCreate) {done();}
      });
      task.index = i;
      tasks[i] = task;
    }
    return tasks;
  }
});
