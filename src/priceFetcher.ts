import axios from 'axios';

// Fetch Solana price
export async function fetchSolanaPrice(): Promise<number | null> {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    return response.data.solana.usd;
  } catch (error) {
    console.error("Error fetching Solana price:", error);
    return null;
  }
}

