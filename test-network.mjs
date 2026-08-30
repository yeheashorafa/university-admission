import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('student/profile') || request.url().includes('student/social-information') || request.url().includes('student/secondary_school_records')) {
      requests.push({ url: request.url(), method: request.method() });
      console.log(`[NETWORK REQUEST] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', async response => {
      const url = response.url();
      if (url.includes('student/profile')) {
          console.log(`[NETWORK RESPONSE] ${response.status()} ${url}`);
          try {
              const text = await response.text();
              console.log(`[NETWORK BODY snippet] ${text.substring(0, 200)}...`);
          } catch {
              console.log(`[NETWORK BODY] could not read`);
          }
      }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/en/login', { waitUntil: 'networkidle2' });
  
  console.log('Filling login form...');
  await page.type('input[type="email"]', 'yeheashorafa6@gmail.com');
  await page.type('input[type="password"]', 'password');
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirect...');
  // Wait until we are no longer on the login page
  await page.waitForFunction(() => !window.location.href.includes('/login'), { timeout: 10000 });
  
  console.log('Navigating to profile...');
  await page.goto('http://localhost:3000/en/profile', { waitUntil: 'networkidle2' });
  
  // Wait a bit to ensure all client-side requests fire (React Query)
  await new Promise(r => setTimeout(r, 5000));
  
  const bodyText = await page.evaluate(() => {
      return document.body.innerText;
  });
  console.log('\n--- UI Text Snippet ---');
  console.log(bodyText.substring(0, 800));
  console.log('-----------------------\n');

  await browser.close();
  console.log('Done.');
})();
