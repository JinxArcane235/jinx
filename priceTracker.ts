import puppeteer from 'puppeteer';
import winston from 'winston';

// Logger Configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'tracker.log' }),
    ],
});

// Constants
const TRADINGVIEW_URL = 'https://www.tradingview.com/chart/?symbol=COINBASE%3ASOLUSD';
const ALERT_RSI_THRESHOLD = { overbought: 70, oversold: 30 };
const ALERT_PRICE_THRESHOLD = { high: 50, low: 40 };
const FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

// Fetch Data from TradingView
async function fetchTradingViewData(): Promise<{ price: number; rsi: number }> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        logger.info('Navigating to TradingView chart...');
        await page.goto(TRADINGVIEW_URL, { waitUntil: 'networkidle2' });

        // Wait for chart and indicators to load
        await page.waitForSelector('.tv-symbol-price-quote');  // Wait for price to appear

        // Extract price and RSI using correct selectors
        const price = await page.evaluate(() => {
            const priceElement = document.querySelector('.tv-symbol-price-quote');  // Price selector
            return priceElement ? parseFloat(priceElement.textContent?.trim() || '0') : 0;
        });

        const rsi = await page.evaluate(() => {
            const rsiElement = document.querySelector('.pane-legend-value');  // RSI selector
            return rsiElement ? parseFloat(rsiElement.textContent?.trim() || '0') : 0;
        });

        logger.info(`Fetched data - Price: $${price}, RSI: ${rsi}`);
        await browser.close();
        return { price, rsi };
    } catch (error) {
        logger.error('Error fetching TradingView data:', error);
        await browser.close();
        throw error;
    }
}

// Trigger Alerts
function triggerAlerts(price: number, rsi: number) {
    if (price > ALERT_PRICE_THRESHOLD.high) {
        const alertMsg = `Price Alert: Price is above threshold! Current Price: $${price}`;
        logger.warn(alertMsg);
    } else if (price < ALERT_PRICE_THRESHOLD.low) {
        const alertMsg = `Price Alert: Price is below threshold! Current Price: $${price}`;
        logger.warn(alertMsg);
    }

    if (rsi > ALERT_RSI_THRESHOLD.overbought) {
        const alertMsg = `RSI Alert: RSI indicates overbought! RSI: ${rsi}`;
        logger.warn(alertMsg);
    } else if (rsi < ALERT_RSI_THRESHOLD.oversold) {
        const alertMsg = `RSI Alert: RSI indicates oversold! RSI: ${rsi}`;
        logger.warn(alertMsg);
    }
}

// Main Tracking Function
async function trackSolana() {
    try {
        const { price, rsi } = await fetchTradingViewData();
        triggerAlerts(price, rsi);
    } catch (error) {
        logger.error('Error in tracking process:', error);
    }
}

// Start Tracking
logger.info('Starting TradingView-based Solana tracker...');
setInterval(trackSolana, FETCH_INTERVAL);
trackSolana(); // Initial call
