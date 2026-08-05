const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport for a good desktop screenshot
  await page.setViewport({ width: 1280, height: 800 });

  const urls = [
    { name: 'home', url: 'https://las-flores-web-0079.vercel.app/' },
    { name: 'carta', url: 'https://las-flores-web-0079.vercel.app/carta' },
    { name: 'admin', url: 'https://las-flores-web-0079.vercel.app/admin' }
  ];

  for (const item of urls) {
    try {
      console.log(`Navigating to ${item.url}...`);
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const path = `screenshot_${item.name}.png`;
      await page.screenshot({ path, fullPage: true });
      console.log(`Saved screenshot to ${path}`);
    } catch (err) {
      console.error(`Failed to screenshot ${item.url}:`, err);
    }
  }

  await browser.close();
}

scrape();
