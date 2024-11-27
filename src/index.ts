import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({ headless: false ,defaultViewport: {
        width: 1415,  
        height: 816  
    } });
    const page = await browser.newPage();
    await page.goto('https://www.tradingview.com/accounts/signin/');
    console.log('Waiting for manual login...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    console.log('Proceeding to chart after 1 minute...');
    await page.goto('https://www.tradingview.com/chart/hmLYX6Nq/?symbol=COINBASE%3ASOLUSD');
    await page.waitForSelector('.chart-container');

    const getSolPriceAndRSI = async () => {
        const data = await page.evaluate(() => {
            const priceElement = document.querySelector('span.highlight-maJ2WnzA.highlight-BSF4XTsE.price-qWcO4bp9') as HTMLElement;
            const rsiElement = document.querySelector('div.valueValue-l31H9iuA.apply-common-tooltip:not([title="Volume"]):is([style*="rgb(255, 237, 71)"])') as HTMLElement;
            const price = priceElement ? priceElement.innerText : null;
            const rsi = rsiElement ? rsiElement.innerText : null;
            return { price, rsi };
        });
        return data;
    };
//logs after every second , to change it to 30 minutes change 1000 to 1800000
    setInterval(async () => {
        const data = await getSolPriceAndRSI();
        console.log(`SOL Price: ${data.price}, RSI: ${data.rsi}`);
    }, 1000);
}


main().catch(error => {
    console.error('Error in the script:', error);
});
