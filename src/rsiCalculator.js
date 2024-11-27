const axios = require('axios');

// Function for calculating RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
  let gains = 0;
  let losses = 0;

  // Calculate gains and losses for the initial period
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  // Calculate average gains and losses
  let averageGain = gains / period;
  let averageLoss = losses / period;

  // Calculate RSI for the rest of the data
  let rsi = 0;
  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      averageGain = ((averageGain * (period - 1)) + change) / period;
      averageLoss = (averageLoss * (period - 1)) / period;
    } else {
      averageLoss = ((averageLoss * (period - 1)) - change) / period;
      averageGain = (averageGain * (period - 1)) / period;
    }

    // Avoid division by zero and calculate RSI
    const rs = averageLoss === 0 ? 100 : averageGain / averageLoss;
    rsi = 100 - (100 / (1 + rs));
  }

  return rsi; // Return the final RSI value
}

// Export the function for use in other modules
module.exports = calculateRSI;
