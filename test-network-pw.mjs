import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept network requests to mock backend
  await page.route('**/*', async route => {
    const url = route.request().url();
    
    if (url.includes('/api/v1/auth/login')) {
      console.log(`[NETWORK MOCK] POST /auth/login`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "Login successful.",
          data: {
            access_token: "fake_token_for_testing",
            token_type: "bearer",
            expires_in: 3600,
            verified: true,
            user: {
              id: 1,
              name: "student",
              email: "yeheashorafa6@gmail.com",
              role: "student"
            }
          }
        })
      });
      return;
    }
    
    if (url.includes('/api/v1/student/profile') && route.request().method() === 'GET') {
      console.log(`[NETWORK MOCK] GET /student/profile Fired!`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            personal_information: {
              first_name_en: "Test",
              national_id: "987654321"
            }
          }
        })
      });
      return;
    }

    if (url.includes('/api/v1/student/social-information') && route.request().method() === 'GET') {
      console.log(`[NETWORK MOCK] GET /student/social-information Fired!`);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
      return;
    }

    if (url.includes('/api/v1/student/secondary_school_records') && route.request().method() === 'GET') {
      console.log(`[NETWORK MOCK] GET /student/secondary_school_records Fired!`);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
      return;
    }

    // Let all other requests (like Next.js static files) pass through
    await route.continue();
  });

  page.on('request', request => {
    if (request.url().includes('student/profile') || request.url().includes('auth/login')) {
      console.log(`[PAGE LOG] Request sent: ${request.method()} ${request.url()}`);
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/en/login', { waitUntil: 'networkidle' });
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'yeheashorafa6@gmail.com');
  await page.fill('input[type="password"]', 'securePass123');
  
  console.log('Clicking submit...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirect...');
  // Wait until we are no longer on the login page
  await page.waitForFunction(() => !window.location.href.includes('/login'), { timeout: 10000 });
  
  console.log('Navigating to profile...');
  await page.goto('http://localhost:3000/en/profile', { waitUntil: 'networkidle' });
  
  // Wait a bit to ensure React Query loads everything
  await page.waitForTimeout(3000);
  
  const bodyText = await page.evaluate(() => {
      return document.body.innerText;
  });
  console.log('\n--- UI Text Snippet (Profile Page) ---');
  console.log(bodyText.substring(0, 800));
  console.log('-----------------------\n');
  
  // Now test Case C (Network error)
  console.log('Testing Case C (Network Error on Profile)...');
  await page.unroute('**/api/v1/student/profile'); // Remove the 200 mock
  await page.route('**/api/v1/student/profile', async route => {
      console.log(`[NETWORK MOCK] GET /student/profile Fired (Returning 500 Network Error)!`);
      await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' })
      });
  });
  
  // clear react query cache by reloading the page
  console.log('Reloading profile page to trigger 500 error...');
  await page.goto('http://localhost:3000/en/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const bodyText500 = await page.evaluate(() => document.body.innerText);
  console.log('\n--- UI Text Snippet (Profile Page - 500 Error) ---');
  console.log(bodyText500.substring(0, 800));
  console.log('-----------------------\n');

  await browser.close();
  console.log('Done.');
})();
