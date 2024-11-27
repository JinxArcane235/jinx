import axios from 'axios';
import * as fs from 'fs';
import { RSI } from 'technicalindicators';

// Constants
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const SOL_ID = 'solana';
const CURRENCY = 'usd';
const FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const RSI_PERIOD = 14; // Standard RSI period
const LOG_FILE = 'tracker.log';

// Historical price storage
const priceHistory: number[] = [];

// Utility: Log data to console and file
function logMessage(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}`;
    console.log(logEntry);
    fs.appendFileSync(LOG_FILE, logEntry + '\n');
}

// Fetch SOL price from CoinGecko API
async function fetchSolPrice(): Promise<number | null> {
    try {
        const response = await axios.get(COINGECKO_API_URL, {
            params: {
                ids: SOL_ID,
                vs_currencies: CURRENCY,
            },
        });
        const price = response.data[`${SOL_ID}`][`${CURRENCY}`];
        if (typeof price === 'number') {
            return price;
        } else {
            logMessage('Invalid API response structure.');
            return null;
        }
    } catch (error: any) {
        logMessage(`Error fetching SOL price: ${error.message}`);
        return null;
    }
}

// Calculate RSI using the technicalindicators library
function calculateRSI(prices: number[]): number | null {
    if (prices.length < RSI_PERIOD) {
        logMessage(`Not enough data points to calculate RSI. Required: ${RSI_PERIOD}, Current: ${prices.length}`);
        return null;
    }
    const rsiValues = RSI.calculate({ values: prices, period: RSI_PERIOD });
    return rsiValues[rsiValues.length - 1];
}

// Trigger alerts based on price changes and RSI thresholds
function triggerAlerts(price: number, rsi: number | null) {
    const previousPrice = priceHistory[priceHistory.length - 2];

    // Price Threshold Alerts
    if (previousPrice) {
        const priceChange = ((price - previousPrice) / previousPrice) * 100;
        if (priceChange > 10) {
            logMessage(`Price Alert: Price increased by more than 10%. Current: $${price}`);
        } else if (priceChange < -10) {
            logMessage(`Price Alert: Price decreased by more than 10%. Current: $${price}`);
        }
    }

    // RSI Threshold Alerts
    if (rsi !== null) {
        if (rsi > 70) {
            logMessage(`RSI Alert: Overbought condition detected. RSI: ${rsi}`);
        } else if (rsi < 30) {
            logMessage(`RSI Alert: Oversold condition detected. RSI: ${rsi}`);
        }
    }
}

// Main tracking function
async function trackSolana() {
    logMessage('Starting Solana price and RSI tracker...');
    while (true) {
        try {
            // Fetch the latest price
            const price = await fetchSolPrice();
            if (price !== null) {
                priceHistory.push(price);
                logMessage(`Fetched price: $${price}`);

                // Calculate RSI if enough data is available
                const rsi = calculateRSI(priceHistory);
                if (rsi !== null) {
                    logMessage(`Calculated RSI: ${rsi}`);
                }

                // Trigger alerts
                triggerAlerts(price, rsi);
            }

            // Wait for the next interval
            logMessage(`Waiting for the next fetch in ${FETCH_INTERVAL / (60 * 1000)} minutes...`);
            await new Promise((resolve) => setTimeout(resolve, FETCH_INTERVAL));
        } catch (error: any) {
            logMessage(`Error in tracking loop: ${error.message}`);
        }
    }
}

// Start the tracker
trackSolana().catch((error) => logMessage(`Fatal error: ${error.message}`));
