bernie - to do
==============

* Threshold crossings:
  * Update _data
  * Write _data to config file

* Bernie accepts commands!
  * Set up http server
  * Commands:
    * BUY
    * SELL
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
