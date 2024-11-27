<<<<<<< HEAD
<<<<<<< HEAD
function calculateRSI(data) {
    let gains = 0, losses = 0;

    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / data.length;
    const avgLoss = losses / data.length;
    const rs = avgGain / avgLoss;

    return 100 - (100 / (1 + rs));
=======
=======
>>>>>>> 7fbbe5b (Fixed Solana price fetcher and RSI calculation logic)
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
<<<<<<< HEAD
>>>>>>> 9b0a8245ffc949b7b0378c3c9d9822497cb2fb3b
=======
>>>>>>> 7fbbe5b (Fixed Solana price fetcher and RSI calculation logic)
}

module.exports = calculateRSI;
