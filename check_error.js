const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('BROWSER_ERROR:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('PAGE_ERROR:', error.message);
    });

    await page.goto('http://localhost:3000/nexus', { waitUntil: 'networkidle0' });
    await browser.close();
  } catch (err) {
    console.error("Script failed:", err);
  }
})();
