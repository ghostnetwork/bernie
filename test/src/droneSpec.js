var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var Drone = require('../../src/drone.js');
require('../../lib/verdoux/predicates.js');
require('../../src/bernie.js');

describe('Drone', function(){
  'use strict';

  var drone = null
    , data = null;
    
  var rawData = {
    "btc": 1.0,
    "cash": 1000.00,
    "originalPrice": 0.00,
    "status": 0,
    "lossThreshold": 0.1,
    "gainThreshold": 0.1
  };

  before(function(){data = rawData;});
  beforeEach(function() {drone = Drone.create();});

  it('should be able to be created', function(){assert(existy(drone));});

  describe('data', function(){
    it('should return an existy data property by default', function(){
      assert(existy(drone.data));
    });
  });

  describe('acceptData', function(){
    it('should retain the data object given it', function(){
      drone.acceptData(data);
      var actual = drone.data;
      actual.btc.should.equal(data.btc);
      actual.cash.should.equal(data.cash);
      actual.originalPrice.should.equal(data.originalPrice);
      actual.status.should.equal(data.status);
      actual.lossThreshold.should.equal(data.lossThreshold);
      actual.gainThreshold.should.equal(data.gainThreshold);
    });
  });
});
