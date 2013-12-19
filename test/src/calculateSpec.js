var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var Calculate = require('../../src/calculate.js');
require('../../lib/verdoux/predicates.js');

describe('Calculate', function(){
  'use strict';

  var calculate;

  beforeEach(function() {calculate = Calculate.create();});

  it('should be able to be created', function(){assert(existy(calculate));});
  
});
