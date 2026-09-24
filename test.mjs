import { chromium } from 'playwright';

async function test1_notifications(browser) {
  console.log("=== Test 1: Notifications ===");
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://university-admission-rqiu.onrender.com/ar/login');
  await page.fill('input[name="email"]', 'test.student.426138574@example.com');
  await page.fill('input[name="password"]', 'Test@12345');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/student**');
  console.log("Logged in as student.");

  await page.waitForTimeout(3000); 
  
  // badge before
  let badgeText = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return null;
    const badge = header.querySelector('.bg-destructive'); // usually red badge
    if (badge) return badge.innerText.trim();
    return "0 or hidden";
  });
  console.log("Unread badge before opening:", badgeText);
  
  let putRequestStatus = null;
  page.on('response', response => {
    if (response.url().includes('/api/v1/notifications/read-all') && response.request().method() === 'PUT') {
      putRequestStatus = response.status();
      console.log("PUT /api/v1/notifications/read-all status:", putRequestStatus);
    }
  });

  await page.goto('https://university-admission-rqiu.onrender.com/ar/notifications');
  await page.waitForTimeout(3000); // wait for request

  if (putRequestStatus === null) {
      console.log("No PUT /api/v1/notifications/read-all request captured.");
  }
  
  // badge after
  badgeText = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return null;
    const badge = header.querySelector('.bg-destructive');
    if (badge) return badge.innerText.trim();
    return "0 or hidden";
  });
  console.log("Unread badge after opening:", badgeText);

  // check for toast
  const toasts = await page.locator('[data-sonner-toast]').count();
  console.log("Number of toasts visible:", toasts);
  if (toasts > 0) {
      const toastTexts = await page.locator('[data-sonner-toast]').allInnerTexts();
      console.log("Toast texts:", toastTexts);
  } else {
      console.log("No toast observed.");
  }
  await context.close();
}

async function test2_createUser(browser) {
  console.log("=== Test 2: Create User ===");
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://university-admission-rqiu.onrender.com/ar/login');
  await page.fill('input[name="email"]', 'admin@admission.test');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/admin**');
  console.log("Logged in as admin.");
  await page.waitForTimeout(2000); 

  let postRequestStatus = null;
  let postResponseBody = null;
  page.on('response', async response => {
    if (response.url().includes('/api/v1/admin/users') && response.request().method() === 'POST') {
      postRequestStatus = response.status();
      try {
        postResponseBody = await response.json();
      } catch(e) {}
      console.log("POST /api/v1/admin/users status:", postRequestStatus);
      console.log("POST /api/v1/admin/users response:", postResponseBody);
    }
  });

  // Navigate to users page to create user
  await page.goto('https://university-admission-rqiu.onrender.com/ar/admin/users');
  await page.waitForTimeout(2000); 

  // Click create button
  // "إضافة مستخدم"
  await page.getByText('إضافة مستخدم').click();
  await page.waitForTimeout(1000);

  const uniqueSuffix = Date.now().toString().slice(-6);
  const email = `test.employee.${uniqueSuffix}@example.com`;
  
  // Fill the form
  await page.fill('input[name="name"]', `Employee ${uniqueSuffix}`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="phone"]', `0599${uniqueSuffix}`);
  await page.fill('input[name="password"]', 'Password@123');
  await page.fill('input[name="password_confirmation"]', 'Password@123');
  
  // role is usually a select or radio. Let's try to find it.
  // We can just click the combobox
  const roleTrigger = page.locator('button[role="combobox"]').first();
  if (await roleTrigger.isVisible()) {
      await roleTrigger.click();
      await page.waitForTimeout(500);
      await page.getByText('موظف قبول').click();
  }

  // submit
  await page.getByRole('button', { name: /حفظ|إضافة/ }).click();
  await page.waitForTimeout(3000);

  // Check if it's in the table
  const userRow = page.locator(`tr:has-text("${email}")`);
  const count = await userRow.count();
  console.log(`Is the new user (${email}) in the table?`, count > 0 ? "Yes" : "No, List mismatch");

  await context.close();
}

async function test4_tawjihiImport(browser) {
  console.log("=== Test 4: Tawjihi Import ===");
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://university-admission-rqiu.onrender.com/ar/login');
  await page.fill('input[name="email"]', 'admin@admission.test');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/admin**');
  console.log("Logged in as admin.");
  await page.waitForTimeout(2000); 

  // Create a dummy CSV file
  const fs = require('fs');
  fs.writeFileSync('dummy.csv', 'seat_number,percentage,total_marks,branch,study_year\n123,90,900,Science,2023');

  let postRequestStatus = null;
  let postRequestBody = null;
  page.on('request', request => {
    if (request.url().includes('/api/v1/admin/secondary-school-records/import') && request.method() === 'POST') {
      postRequestBody = request.postData();
      console.log("POST /import payload has graduation_year?", postRequestBody && postRequestBody.includes('graduation_year') ? "Yes" : "No");
    }
  });
  page.on('response', response => {
    if (response.url().includes('/api/v1/admin/secondary-school-records/import') && response.request().method() === 'POST') {
      postRequestStatus = response.status();
      console.log("POST /import status:", postRequestStatus);
    }
  });

  await page.goto('https://university-admission-rqiu.onrender.com/ar/admin/tawjihi-import'); // adjust if URL is different
  await page.waitForTimeout(2000);

  // We need to trigger the import. The user wants to see what happens when graduation_year is missing (422).
  // I will just use fetch in evaluate to directly hit the endpoint since I don't know the exact UI.
  console.log("Sending fetch request with missing graduation_year...");
  const fetchResult = await page.evaluate(async () => {
    const tokenMatch = document.cookie.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : '';
    const formData = new FormData();
    const blob = new Blob(['seat_number\n123'], { type: 'text/csv' });
    formData.append('file', blob, 'test.csv');
    // omitting graduation_year
    
    const res = await fetch('https://university-admission-rqiu.onrender.com/api/v1/admin/secondary-school-records/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return { status: res.status };
  });
  console.log("Fetch result status:", fetchResult.status);
  
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await test1_notifications(browser);
    await test2_createUser(browser);
    await test4_tawjihiImport(browser);
  } catch (e) {
    console.error(e);
  }
  
  await browser.close();
})();
