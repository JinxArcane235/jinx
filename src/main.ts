import { fetchSolanaPrice } from './priceFetcher';
import { calculateRSI } from './rsiCalculator';

async function main() {
  // Fetch the current Solana price
  const solanaPrice = await fetchSolanaPrice();
  console.log("Current Solana Price:", solanaPrice);

  // Simulate fetching historical data (you would replace this with actual data)
  const historicalPrices = [100, 102, 104, 103, 101, 100, 102, 104, 106, 108, 107, 106, 105, 104, 103];

  // Calculate RSI based on historical prices
  const rsiValue = calculateRSI(historicalPrices);
  console.log("RSI Value:", rsiValue);
}

// Run the main function
main();
