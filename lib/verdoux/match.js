
(function() {
  'use strict';
  
  function Match(){
    var that = {};

    that.do = function(actual, expected, data, action) {
      if (actual === expected) {action(data);}
      return that;
    };
    
    return that;
  };
  Match.create = function() {return new Match();};

  module.exports = Match;

}).call(this);
