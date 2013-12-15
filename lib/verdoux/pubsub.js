function PubSub() {
  var that = {};
  var _subscribers = [];

  that.on = 
  that.subscribe = function(topic, subscriber) {
    var subscribers = _subscribers[topic];
    if (!subscribers) {
      _subscribers[topic] = [subscriber];
    }
    else  {
      subscribers.push(subscriber);
    }
  }

  that.off =
  that.unsubscribe = function(topic, subscriber) {
    var subscribers = _subscribers[topic];
    if (!subscribers) return;

    subscribers.forEach(function(item, index) {
      if (item == subscriber) {
        if (subscribers.length == 1) {delete(_subscribers[topic]);}
        else {subscribers.splice(index, 1);}
        return;
      }
    });
  }

  that.publish = function(topic, payload) {
    var subscribers = _subscribers[topic];
    if (!subscribers) {return;}

    subscribers.forEach(function(item, index) {
      item(payload);
    });
  }
  
  return that;
}

PubSub.create = function(){return new PubSub();};
PubSub.global = PubSub.create();

if (typeof module !== 'undefined') {module.exports = PubSub;}
