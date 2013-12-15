#!/usr/bin/env node

'use strict';

var Bernie = require('../index');
var bernie;


var options = {
};

try {
  bernie = Bernie.create(options);
}
catch(err) {
  console.log(err.stack);
  process.exit(1);
}

bernie.start();
