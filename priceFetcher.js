const axios = require('axios');

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
