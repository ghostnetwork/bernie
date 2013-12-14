'use strict';

var assert = require('assert')
  , util = require('util');
var Bernie = require('..');

var bernie;

bernie = new Bernie();

describe('Bernie', function(){

  it('should not fail', function(){
    var clone = Bernie.create();
    assert(clone !== null);
  });
});
