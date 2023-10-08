const readline = require('readline');
const puppeteer = require('puppeteer')
const urlPattern = /^https:\/\/www\.getmidas\.com\/canli-borsa\/[a-zA-Z0-9-]+\/$/;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askUrl() {
    rl.question('Please enter a getmidas URL: ', async (url) => {
        if (urlPattern.test(url)) {
            console.log('Fetching data please wait...')
            const regexPattern = /\/([^/]+)\/$/;
            const match = url.match(regexPattern);

            const browser = await puppeteer.launch({ headless: "new" });
            const page = await browser.newPage();

            await page.goto('https://www.getmidas.com');
            await page.evaluate(() => {
                localStorage.setItem('hide-cookie', 'true');
            });

            await page.goto(url);
            await page.waitForSelector('#line-chart');
            await page.screenshot({ path: `./screenshots/${match[1]}.png`, clip: { x: 0, y: 220, width: 800, height: 450 } });
            const result = await page.evaluate(async () => {
                const divsWithClassData = document.querySelectorAll('div.data');
                const marketData = {};

                for (const div of divsWithClassData) {
                    const pElement = div.querySelector('p');
                    const aElement = div.querySelector('a');
                    const spanElement = div.querySelector('span');

                    if (pElement || aElement) {
                        const text = pElement ? pElement.textContent : aElement.textContent;
                        marketData[text] = spanElement ? spanElement.textContent : ''
                    }
                }
                return marketData;
            });
            console.clear()
            console.log(result)
        }
        else {
            console.log('Please enter valid url! Example: https://www.getmidas.com/canli-borsa/a1cap-hisse/')
            return askUrl()
        }
        rl.close();
    });
}

askUrl()

rl.on('close', () => {
    process.exit(0);
});
