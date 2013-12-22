var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var ThresholdCheck = require('../../src/thresholdCheck.js');
var Calculate = require('../../src/calculate.js');
var PubSub = require('../../lib/verdoux/pubsub.js');
require('../../lib/verdoux/predicates.js');

var kResult = {
  market: 
    {
      bid: '650.00900',
      ask: '653.90000',
      last: '653.90000',
      high: '700.00000',
      low: '700.00000',
      volume: '11393.95253738',
      average: '660.23865',
      timestamp: 1387749514340148 
    },
  timestamp: 1387749536112,
  elapsed: 283,
  data: 
  { 
    btc: 1.5384402369813341,
    cash: 1000,
    originalPrice: '650.00900',
    status: 1,
    lossThreshold: 0.1,
    gainThreshold: 0.1 },
    originalStatus: 0,
    currentPrice: '650.00900',
    originalPosition: 1000,
    previousLast: null,
    position: 1000,
    deltaLast: 650.009,
    positionDelta: 0,
    positionDeltaPercent: 0 
  };

describe('ThresholdCheck', function(){
  'use strict';

  var thresholdCheck;

  beforeEach(function() {thresholdCheck = ThresholdCheck.create();});

  it('should be able to be created', function(){assert(existy(thresholdCheck));});
  
  describe('onDidCalculateResults', function(){
    it('should publish DidCheckThreshold event', function(done){
      console.log('\nBEGIN should publish DidCheckThreshold event --------------- ');

      console.log('<<< spec is subscribing to DidCheckThreshold <<<<<<<<<<<<<<<<<<');
      var subscriberId = PubSub.global.on(ThresholdCheck.Events.DidCheckThreshold, 
        function(result, subscriberId) {
          // console.log('onDidCheckThreshold() result: ' + util.inspect(result));
          console.log('<><><> onDidCheckThreshold: ' + subscriberId);
          // done();
      });

      console.log('>>> spec is publishing DidCalculateResults >>>>>>>>>>>>>>>>');
      PubSub.global.publish(Calculate.Events.DidCalculateResults, kResult);

      console.log('END should publish DidCheckThreshold event --------------- ');
    });
  });
});
