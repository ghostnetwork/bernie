bernie - to do
==============

* Twitter
  * Tweet:
    * Entry (and re-entry) into market
    * Threshold crossings / sells

* Bernie accepts commands!
  * Use Twitter
    * 
  * Alternative:
    * Set up http server
  * Commands:
    * ?

{
  "btc": 469.1194,
  "cash": 339642.48,
  "originalPrice": 724.00,
  "status": 0,
  "lossThreshold": -1.5,
  "gainThreshold": 3.0
}
    /*
      Bid is the most someone is willing to pay for something 
      Ask is the least that someone is asking for when they are selling something.
      Market is just a sale at whatever the highest bid or lowest ask is
      Limit is when you specify the most you are going to pay or the least you are going to sell for.
    */
    //           btc: 1
    //          cash: 580.11
    // originalPrice: 580.1100
    //     sellPrice: 592.00000 (market.ask)
    //     gain/loss: +2.0496%

    // calculate # of btc; add / subtract
    // x = 580.11 / 



  /*
  that.sell = function(market) {
    var value = _data.btc / market.ask;

    console.log('sell: market: ' + util.inspect(market));
    console.log('value (cash): ' + value);
    _data.cash = value;
    _data.status = -1;
    console.log('_data: ' + util.inspect(_data));
  }

  that.buy = function(market) {
  }
  */