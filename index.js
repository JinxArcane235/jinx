const fetchSolanaPrice = require('./priceFetcher');
const calculateRSI = require('./rsiCalculator');

async function main() {
    const price = await fetchSolanaPrice();
    if (price) console.log(`Current Solana price: $${price}`);

    // Example RSI calculation with mock data
    const priceData = [21, 22, 20, 19, 24]; // Replace with real data
    const rsi = calculateRSI(priceData);
    console.log(`Calculated RSI: ${rsi}`);
}

main();
