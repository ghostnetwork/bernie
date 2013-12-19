'use strict';

var util = require('util');
var Bernie = require('./src/bernie.js');
var bernie;

var options = {};

try {
  bernie = Bernie.create(options);
  bernie.init();
  bernie.start();
}
catch(err) {
  console.log(err.stack);
  process.exit(1);
}

module.exports = bernie;
