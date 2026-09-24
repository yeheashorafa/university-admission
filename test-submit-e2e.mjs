import xlsx from 'xlsx';
import fs from 'fs';

const BASE_URL = 'https://university-admission-backend.onrender.com';
const ADMIN_EMAIL = 'admin@admission.test';
const ADMIN_PASS = 'password';

// Helper to auto-retry fetch
async function fetchRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      console.log(`Fetch failed (attempt ${i+1}):`, e.message);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function login(email, password) {
  const res = await fetchRetry(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed for ' + email);
  const data = await res.json();
  return data.data?.access_token || data.access_token;
}

async function run() {
  console.log('=== Test: Generate Tawjihi, Import & Submit ===');
  
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASS);
  const studentEmail = 'test.student.426138574@example.com';
  const studentToken = await login(studentEmail, 'Test@12345');
  console.log('Logged in Admin & Student');

  // 1. Generate Excel Buffer
  const ws = xlsx.utils.json_to_sheet([{
    national_id: '426138574',
    seat_number: '12345678',
    average: '95.5',
    branch: 'scientific',
    graduation_year: '2026',
    school_name: 'Test School',
    directorate: 'Gaza'
  }]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  const file = new File([buffer], 'tawjihi.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('graduation_year', '2026');

  // 2. Import Excel
  console.log('Importing Tawjihi record...');
  const importRes = await fetchRetry(`${BASE_URL}/api/v1/admin/secondary-school-records/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData
  });
  console.log('Import status:', importRes.status);
  console.log('Import response:', await importRes.text());
  
  // Wait a few seconds for background processing
  console.log('Waiting for background processing (5s)...');
  await new Promise(r => setTimeout(r, 5000));

  // 3. Setup draft app for submit (App ID 5)
  const appId = 5;
  console.log('Using Draft Application ID:', appId);
  
  const appStateRes = await fetchRetry(`${BASE_URL}/api/v1/student/applications/${appId}`, {
     headers: { Authorization: `Bearer ${studentToken}` }
  });
  let appState = await appStateRes.json();
  console.log('Status before submit:', appState.data?.status || appState.application?.status);
  
  // Update preferences
  console.log('Updating preferences...');
  await fetchRetry(`${BASE_URL}/api/v1/student/applications/${appId}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ preferences: [{ program_id: 1, order: 1 }] })
  });

  // 4. Submit the application
  console.log('Submitting application...');
  const submitRes = await fetchRetry(`${BASE_URL}/api/v1/student/applications/${appId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  
  console.log('Submit status code:', submitRes.status);
  console.log('Raw response:', await submitRes.text());

  // 5. Verify status changed
  const appStateResFinal = await fetchRetry(`${BASE_URL}/api/v1/student/applications/${appId}`, {
     headers: { Authorization: `Bearer ${studentToken}` }
  });
  const appStateFinal = await appStateResFinal.json();
  console.log('Returned status (refetched):', appStateFinal.data?.status || appStateFinal.application?.status);
  console.log('assigned_reviewer_id present?', appStateFinal.data?.assigned_reviewer_id || 'none');

}

run().catch(console.error);
