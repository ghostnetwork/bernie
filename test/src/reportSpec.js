var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
var Report = require('../../src/report.js');
require('../../lib/verdoux/predicates.js');

describe('Report', function(){
  'use strict';

  var report
    , result = {
        market: { 
          bid: '694.15318',
          ask: '697.00000',
          last: '697.00000',
          high: '715.00000',
          low: '715.00000',
          volume: '54896.83846731',
          average: '610.97453',
          timestamp: 1387466742360969
        },
        elapsed: 250
      };

  beforeEach(function() {report = Report.create();});

  it('should be able to be created', function(){assert(existy(report));});
  
});
