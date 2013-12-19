'use strict';

require('..');
var assert = require('assert')
  , util = require('util');


describe('index.js', function(){

  var bernie = module.children[0];

  it('should not fail', function(){
    (typeof bernie != 'undefined').should.be.true;
  });
});
