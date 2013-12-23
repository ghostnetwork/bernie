var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var MtGoxService = require('../../src/mtgoxService.js');
require('../../lib/verdoux/predicates.js');
require('../../src/bernie.js');

describe('MtGoxService', function(){
  'use strict';

  var mtgoxService = null
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
  beforeEach(function() {mtgoxService = MtGoxService.create();});

  it('should be able to be created', function(){assert(existy(mtgoxService));});

  describe('data', function(){
    it('should return an existy data property by default', function(){
      assert(existy(mtgoxService.data));
    });
  });

  describe('acceptData', function(){
    it('should retain the data object given it', function(){
      mtgoxService.acceptData(data);
      var actual = mtgoxService.data;
      actual.btc.should.equal(data.btc);
      actual.cash.should.equal(data.cash);
      actual.originalPrice.should.equal(data.originalPrice);
      actual.status.should.equal(data.status);
      actual.lossThreshold.should.equal(data.lossThreshold);
      actual.gainThreshold.should.equal(data.gainThreshold);
    });
  });
});
