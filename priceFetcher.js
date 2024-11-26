const axios = require('axios');
const calculateRSI = require('./rsiCalculator');  // Import the RSI function

// Fetch Solana price
async function fetchSolanaPrice() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    return response.data.solana.usd;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
}

// Fetch historical Solana prices for RSI calculation
async function fetchHistoricalData() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=30');
    const prices = response.data.prices.map(price => price[1]);  // Extract price data
    return prices;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return null;
  }
}

// Main function to fetch price and RSI
async function main() {
  const price = await fetchSolanaPrice();
  if (price) {
    console.log(`Current Solana Price: $${price}`);
  }

  const historicalPrices = await fetchHistoricalData();
  if (historicalPrices && historicalPrices.length > 0) {
    const rsi = calculateRSI(historicalPrices);
    console.log(`RSI for Solana: ${rsi}`);
  }
}

main();const axios = require('axios');

// Fetch Solana price
async function fetchSolanaPrice() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    return response.data.solana.usd;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
}

module.exports = fetchSolanaPrice;
