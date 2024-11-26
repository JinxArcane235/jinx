const puppeteer = require('puppeteer');

(async () => {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: false }); // Set to false for debugging (shows the browser)
    const page = await browser.newPage();

    // Go to the TradingView login page
    await page.goto('https://www.tradingview.com/accounts/signin/');

    // Wait for 2 minute (120,000 ms) to allow manual login
    console.log('Waiting for manual login...');
    await new Promise(resolve => setTimeout(resolve, 120000)); // Wait for 2 minute

    // After the manual login, go to the TradingView chart page
    console.log('Proceeding to chart after 1 minute...');
    await page.goto('https://www.tradingview.com/chart/hzNp15qZ/?symbol=COINBASE%3ASOLUSD');

    // Wait for the chart to load
    await page.waitForSelector('.chart-container');

    // Function to get the SOL price and RSI
    const getSolPriceAndRSI = async () => {
        const data = await page.evaluate(() => {
            // Find the price element based on the provided HTML structure
            const priceElement = document.querySelector('span.highlight-maJ2WnzA.highlight-BSF4XTsE.price-qWcO4bp9');
            const rsiElement = document.querySelector('div.valueValue-l31H9iuA.apply-common-tooltip');

            const price = priceElement ? priceElement.innerText : null;
            const rsi = rsiElement ? rsiElement.innerText : null;

            return { price, rsi };
        });
        return data;
    };

    // Collect data at 30 minute intervals
    setInterval(async () => {
        const data = await getSolPriceAndRSI();
        console.log(`SOL Price: ${data.price}, RSI: ${data.rsi}`);
    }, 1800000); // every 30 minutes

    // Keep the browser running
})();

