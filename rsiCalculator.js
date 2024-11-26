// rsiCalculator.js

// Calculate the RSI (Relative Strength Index) for a set of prices
function calculateRSI(prices, period = 14) {
    let gains = 0;
    let losses = 0;

    // Calculate the gain and loss
    for (let i = 1; i < period; i++) {
        let change = prices[i] - prices[i - 1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;  // Losses are treated as positive values
        }
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;
    
    const rs = averageGain / averageLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
}

module.exports = calculateRSI;
