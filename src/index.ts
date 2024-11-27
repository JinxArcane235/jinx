import axios from "axios";

interface SolanaMarketData {
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

interface PricePoint {
  timestamp: number;
  price: number;
}

class SolanaPriceTracker {
  private readonly POLLING_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private timer: NodeJS.Timeout | null = null;
  private priceHistory: PricePoint[] = [];
  private readonly RSI_PERIOD = 14; // Standard RSI period
  private readonly FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  private readonly axiosInstance = axios.create({
    baseURL: "https://api.coingecko.com/api/v3",
    headers: {
      accept: "application/json",
    },
  });

  async fetchSolanaPrice(): Promise<SolanaMarketData> {
    try {
      const response = await this.axiosInstance.get(
        "/coins/markets?vs_currency=usd&ids=solana&per_page=1"
      );
      return response.data[0];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.log("Rate limit reached, waiting before retry...");
        await new Promise((resolve) => setTimeout(resolve, 60000));
        return this.fetchSolanaPrice();
      }
      console.error("Error fetching Solana price:", error);
      throw error;
    }
  }

  private get4HourCandles(): number[] {
    const now = Date.now();
    const fourHourCandles: number[] = [];
    let currentTime = now;

    // Initialize with default values if not enough history
    while (fourHourCandles.length < this.RSI_PERIOD + 1) {
      const periodStart = currentTime - this.FOUR_HOURS;
      const periodPrices = this.priceHistory.filter(
        (p) => p.timestamp > periodStart && p.timestamp <= currentTime
      );

      if (periodPrices.length > 0) {
        // Use the last price in the 4-hour period
        fourHourCandles.unshift(periodPrices[periodPrices.length - 1].price);
      } else if (this.priceHistory.length > 0) {
        // If no prices in this period, use the latest available price
        fourHourCandles.unshift(
          this.priceHistory[this.priceHistory.length - 1].price
        );
      }

      currentTime -= this.FOUR_HOURS;
    }

    return fourHourCandles;
  }

  calculateRSI(prices: number[]): number {
    if (prices.length < this.RSI_PERIOD + 1) {
      throw new Error("Not enough data to calculate RSI");
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= this.RSI_PERIOD; i++) {
      const difference = prices[i] - prices[i - 1];
      if (difference >= 0) {
        gains += difference;
      } else {
        losses -= difference;
      }
    }

    let avgGain = gains / this.RSI_PERIOD;
    let avgLoss = losses / this.RSI_PERIOD;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  async startTracking(): Promise<void> {
    try {
      console.log("Starting price tracking...");
      const initialPrice = await this.fetchSolanaPrice();
      this.priceHistory.push({
        timestamp: Date.now(),
        price: initialPrice.current_price,
      });
      this.logPriceData(initialPrice);
    } catch (error) {
      console.error("Initial data fetch failed:", error);
      return;
    }

    this.timer = setInterval(async () => {
      try {
        const priceData = await this.fetchSolanaPrice();
        this.priceHistory.push({
          timestamp: Date.now(),
          price: priceData.current_price,
        });

        // Keep only the last 56 price points (14 periods * 4 hours)
        const retentionPeriod = this.FOUR_HOURS * (this.RSI_PERIOD + 1);
        const cutoffTime = Date.now() - retentionPeriod;
        this.priceHistory = this.priceHistory.filter(
          (p) => p.timestamp > cutoffTime
        );

        const fourHourCandles = this.get4HourCandles();
        const rsi = this.calculateRSI(fourHourCandles);
        this.logPriceData(priceData, rsi);
      } catch (error) {
        console.error("Price update failed:", error);
      }
    }, this.POLLING_INTERVAL);
  }

  stopTracking(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private logPriceData(priceData: SolanaMarketData, rsi?: number): void {
    console.log("\n=== Solana Price Analysis ===");
    console.log(`Timestamp: ${priceData.last_updated}`);
    console.log(`SOL Price: $${priceData.current_price.toFixed(2)}`);
    console.log(
      `24h Change: ${priceData.price_change_percentage_24h.toFixed(2)}%`
    );
    console.log(`24h High: $${priceData.high_24h.toFixed(2)}`);
    console.log(`24h Low: $${priceData.low_24h.toFixed(2)}`);
    console.log(`4h RSI: ${rsi ? rsi.toFixed(2) : "N/A"}`); // Default to neutral RSI if not enough data
    console.log("==========================\n");
  }
}

// Create and start the tracker
const tracker = new SolanaPriceTracker();

console.log("Starting Solana Price Tracker...");
tracker.startTracking().catch((error) => {
  console.error("Failed to start tracking:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nStopping Solana Price Tracker...");
  tracker.stopTracking();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nStopping Solana Price Tracker...");
  tracker.stopTracking();
  process.exit(0);
});
