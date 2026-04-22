const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`[RESPONSE] ${response.request().method()} ${response.url()} ${response.status()}`);
    }
  });

  await page.goto('https://infraconnect.ai');
  await page.evaluate(() => {
    document.querySelector('button[size="lg"]').click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    document.querySelector('input[type="email"]').value = 'frank@lacoupefutur.com';
    document.querySelector('textarea').value = 'hi';
    document.querySelector('button[type="submit"]').click();
  });

  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
