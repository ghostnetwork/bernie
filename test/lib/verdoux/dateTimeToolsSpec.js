var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var util = require('util');
require('../../../lib/verdoux/dateTimeTools.js');
require('../../../lib/verdoux/predicates.js');

describe('DateTimeTools', function(){
  'use strict';


  it('should be able to access the functions', function(){
    assert(existy(monthToString));
  });

  describe('monthToString', function(){
    it('should return null if month is less than zero', function(){
      var month = -1;
      var result = monthToString(month);
      notExisty(result).should.be.true;
    });

    it('should return null if month is greater than 11', function(){
      var month = 12;
      var result = monthToString(month);
      notExisty(result).should.be.true;
    });

    it('should return a non-empty string for values between zero and 11 inclusive', function(){
      var month = 0;
      for (var i = 0; i < 12; i++) {
        month = i;
        var result = monthToString(month);
        existy(result).should.be.true;
        (result.length > 0).should.be.true;
      }
    });
  });

  describe('monthToShortString', function(){
    it('should return null if month is less than zero', function(){
      var month = -1;
      var result = monthToShortString(month);
      notExisty(result).should.be.true;
    });

    it('should return null if month is greater than 11', function(){
      var month = 12;
      var result = monthToShortString(month);
      notExisty(result).should.be.true;
    });

    it('should return a non-empty string for values between zero and 11 inclusive', function(){
      var month = 0;
      for (var i = 0; i < 12; i++) {
        month = i;
        var result = monthToShortString(month);
        existy(result).should.be.true;
        (result.length > 0).should.be.true;
      }
    });
  });

  describe('dayToString', function(){
    it('should return null if day is less than zero', function(){
      var day = -1;
      var result = dayToString(day);
      notExisty(result).should.be.true;
    });

    it('should return null if day is greater than 6', function(){
      var day = 7;
      var result = dayToString(day);
      notExisty(result).should.be.true;
    });

    it('should return a non-empty string for values between 0 and 6 inclusive', function(){
      var day = 0;
      for (var i = 0; i < 7; i++) {
        day = i;
        var result = dayToString(day);
        existy(result).should.be.true;
        (result.length > 0).should.be.true;
      }
    });
  });

  describe('dayToShortString', function(){
    it('should return null if day is less than zero', function(){
      var day = -1;
      var result = dayToShortString(day);
      notExisty(result).should.be.true;
    });

    it('should return null if day is greater than 6', function(){
      var day = 7;
      var result = dayToShortString(day);
      notExisty(result).should.be.true;
    });

    it('should return a non-empty string for values between 0 and 6 inclusive', function(){
      var day = 0;
      for (var i = 0; i < 7; i++) {
        day = i;
        var result = dayToShortString(day);
        existy(result).should.be.true;
        (result.length > 0).should.be.true;
      }
    });
  });

  describe('padWithZeros', function(){
    it('should return undefined result if given undefined text', function(){
      var text;
      var length = 10;
      var result = padWithZeros(text, length);
      (typeof result == 'undefined').should.be.true;
    });

    it('should return null result if given null text', function(){
      var text = null;
      var length = 3;
      var result = padWithZeros(text, length);
      notExisty(result).should.be.true;
    });

    it('should not pad the given text if it is >= length', function(){
      var text = '123';
      var length = 3;
    });

    it('should pad the given text with the appropriate number of zero characters', function(){
      var text = '1';
      var length = 3;
      var result = padWithZeros(text, length);
      existy(result).should.be.true;
      (result.length).should.equal(length);
    });

    it('should pad the given text with the appropriate number of zero characters', function(){
      var text = '123';
      var length = 10;
      var result = padWithZeros(text, length);
      existy(result).should.be.true;
      (result.length).should.equal(length);
    });
  });
});
