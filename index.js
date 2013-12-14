'use strict';

function Bernie(options) {
  var that = {get options(){return _options;}};
  var _options = options;
  return that;
};

Bernie.create = function(options) {return new Bernie(options);};
Bernie.prototype.log = function(message) {console.log.message(message);}

module.exports = Bernie;
