
(function() {
  'use strict';
  
  function App(){};
  App.create = function() {return new App();};
  
  App.Events = {
    UpdateConfig: 'update.config'   // @param: config
  };

  App.Status = {
    Unknown: Number.MIN_VALUE,
    EnteringMarket: 0,
    InMarket: 1,
    Waiting: -2,

    statusToString: function(appStatus) {
      switch (appStatus) {
        case App.Status.Unknown: return 'Unknown';
        case App.Status.EnteringMarket: return 'EnteringMarket';
        case App.Status.InMarket: return 'InMarket';
        case App.Status.Waiting: return 'Waiting';
        default: return null;
      }
    }
  };

  module.exports = App;
}).call(this);
