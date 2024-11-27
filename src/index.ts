import axios from "axios";
import winston from "winston";

interface SolanaMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

class SolanaPriceTracker {
  private readonly POLLING_INTERVAL = 30 * 60 * 1000;
  private timer: NodeJS.Timeout | null = null;
  private readonly RSI_PERIOD = 14;
  private priceHistory: number[] = [];

  private readonly logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "price-tracker.log" }),
    ],
  });

  private readonly axiosInstance = axios.create({
    baseURL: "https://api.coingecko.com/api/v3",
    headers: {
      accept: "application/json",
    },
  });

  async fetchSolanaPrice(): Promise<SolanaMarketData> {
    try {
      const response = await this.axiosInstance.get("/coins/markets", {
        params: {
          vs_currency: "usd",
          ids: "solana",
          order: "market_cap_desc",
          per_page: 1,
          page: 1,
          sparkline: false,
          precision: 2,
          price_change_percentage: "24h",
        },
      });

      if (!response.data?.[0]) {
        throw new Error("No data received for Solana");
      }

      return response.data[0];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        this.logger.warn("Rate limit reached, waiting before retry...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return this.fetchSolanaPrice();
      }
      this.logger.error("Error fetching Solana price:", error);
      throw error;
    }
  }

  private updatePriceHistory(price: number): void {
    if (!isNaN(price) && isFinite(price)) {
      this.priceHistory.push(price);
      if (this.priceHistory.length > this.RSI_PERIOD + 1) {
        this.priceHistory.shift();
      }
    }
  }

  calculateRSI(): number {
    if (this.priceHistory.length < this.RSI_PERIOD + 1) {
      throw new Error("Not enough data to calculate RSI");
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= this.RSI_PERIOD; i++) {
      const difference = this.priceHistory[i] - this.priceHistory[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    const avgGain = gains / this.RSI_PERIOD;
    const avgLoss = losses / this.RSI_PERIOD || 1;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  async startTracking(): Promise<void> {
    try {
      this.logger.info("Starting price tracking...");
      const priceData = await this.fetchSolanaPrice();
      this.updatePriceHistory(priceData.current_price);
      this.logPriceData(priceData);
    } catch (error) {
      this.logger.error("Initial data fetch failed:", error);
      return;
    }

    this.timer = setInterval(async () => {
      try {
        const priceData = await this.fetchSolanaPrice();
        this.updatePriceHistory(priceData.current_price);

        let rsi: number | undefined;
        if (this.priceHistory.length >= this.RSI_PERIOD + 1) {
          rsi = this.calculateRSI();
        }

        this.logPriceData(priceData, rsi);
      } catch (error) {
        this.logger.error("Price update failed:", error);
      }
    }, this.POLLING_INTERVAL);
  }

  stopTracking(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.info("Price tracking stopped");
    }
  }

  private logPriceData(priceData: SolanaMarketData, rsi?: number): void {
    const logData = {
      timestamp: priceData.last_updated,
      name: priceData.name,
      symbol: priceData.symbol.toUpperCase(),
      price: priceData.current_price.toFixed(2),
      market_cap: priceData.market_cap.toLocaleString(),
      rank: priceData.market_cap_rank,
      change_24h: priceData.price_change_percentage_24h.toFixed(2),
      high_24h: priceData.high_24h.toFixed(2),
      low_24h: priceData.low_24h.toFixed(2),
      rsi: rsi ? rsi.toFixed(2) : "Calculating...",
    };

    this.logger.info("Price Analysis", logData);

    console.log("\n=== Solana Price Analysis ===");
    console.log(`Timestamp: ${logData.timestamp}`);
    console.log(`Name: ${logData.name} (${logData.symbol})`);
    console.log(`Market Cap Rank: #${logData.rank}`);
    console.log(`Market Cap: $${logData.market_cap}`);
    console.log(`Price: $${logData.price}`);
    console.log(`24h Change: ${logData.change_24h}%`);
    console.log(`24h High: $${logData.high_24h}`);
    console.log(`24h Low: $${logData.low_24h}`);
    console.log(`RSI: ${logData.rsi}`);
    console.log("==========================\n");
  }
}

// Start the tracker
const tracker = new SolanaPriceTracker();
tracker.startTracking();

// Handle shutdown gracefully
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down...");
  tracker.stopTracking();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nGracefully shutting down...");
  tracker.stopTracking();
  process.exit(0);
});
