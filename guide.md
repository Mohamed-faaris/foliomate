# foliomate

tech stack : next.js , tailwindcss , mongodb , trpc , zod , shadcn ui
    
Stock Price Lookup
Provide functionality for users to search and look up real-time stock prices.

'use strict';
var request = require('request');

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo';

request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else {
      // data is successfully parsed as a JSON object:
      console.log(data);
    }
});
 API key: LELA4Q1GENB8IQ51


Functionalities

    User Authentication: Users can register, log in, and log out with session handling.

    Look Up Stock Quotes: Users can query real-time stock prices via an external API (like IEX).

    Buy Stocks: Users can buy stocks if they have sufficient virtual cash. This updates the portfolio and cash balance.

    Sell Stocks: Users can sell owned stocks, updating their portfolio and cash balance.

    View Portfolio: Displays current holdings with real-time valuation.

    Transaction History: Logs all buy and sell orders with timestamps and prices.

    Cash Management: Tracks available cash for buying stocks.


    Watchlist Page:

        A table listing stocks added to the watchlist.

        Columns typically include Stock Symbol, Company Name, Current Price, Price Change (optional), and a Remove button.

        An Add Stock form where users can input a stock symbol to add to their watchlist.
