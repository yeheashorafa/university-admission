const axios = require('axios');

const BASE_URL = 'https://university-admission-backend.onrender.com/api/v1';

async function run() {
  try {
    // 1. Login as student
    console.log("--- Student ---");
    const stuRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'yeheashorafa6@gmail.com',
      password: 'password'
    }).catch(e => e.response);
    let stuToken = stuRes?.data?.data?.access_token || stuRes?.data?.data?.token;
    console.log("Student login:", stuRes?.status);

    if (!stuToken) {
      console.log("Registering new student...");
      const random = Math.floor(Math.random() * 100000);
      const regRes = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test Student',
        national_id: `40${random}991`,
        email: `teststu${random}@example.com`,
        password: 'password',
        password_confirmation: 'password',
        phone: `+970599${random}`
      }).catch(e => e.response);
      console.log("Register:", regRes?.status, regRes?.data);
      stuToken = regRes?.data?.data?.access_token || regRes?.data?.data?.token;
    }

    let appId = null;
    let appStatus = null;

    if (stuToken) {
      // Get student dashboard/applications
      const dashRes = await axios.get(`${BASE_URL}/student/dashboard`, {
        headers: { Authorization: `Bearer ${stuToken}` }
      }).catch(e => e.response);
      
      let apps = dashRes?.data?.data?.applications || dashRes?.data?.applications;
      if (!apps || apps.length === 0) {
        // Try getting from applications endpoint
        const appsRes = await axios.get(`${BASE_URL}/student/applications`, {
          headers: { Authorization: `Bearer ${stuToken}` }
        }).catch(e => e.response);
        apps = appsRes?.data?.data || appsRes?.data;
      }
      
      if (apps && apps.length > 0) {
        appId = apps[0].id;
        appStatus = apps[0].status;
        console.log(`Found existing app: ${appId}, status: ${appStatus}`);
      } else {
        // create one
        const createRes = await axios.post(`${BASE_URL}/student/applications`, {
          program_id: 1,
          application_type_id: 1,
          admission_cycle_id: 1,
        }, { headers: { Authorization: `Bearer ${stuToken}` }}).catch(e => e.response);
        console.log("Created app:", createRes?.status);
        appId = createRes?.data?.data?.id || createRes?.data?.id;
        appStatus = createRes?.data?.data?.status || createRes?.data?.status;
      }

      // If status is draft, try to submit
      if (appId && appStatus === 'draft') {
        console.log(`Submitting app ${appId}...`);
        const subRes = await axios.post(`${BASE_URL}/student/applications/${appId}/submit`, {}, {
          headers: { Authorization: `Bearer ${stuToken}` }
        }).catch(e => e.response);
        console.log("Submit res status:", subRes?.status);
        if (subRes?.status === 200 || subRes?.status === 201) {
          appStatus = subRes?.data?.data?.status || subRes?.data?.status || 'submitted';
        } else {
          console.log("Submit failed:", subRes?.data);
        }
      }
    }

    // 2. Admin
    console.log("\n--- Admin ---");
    const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admission.test',
      password: 'password'
    }).catch(e => e.response);
    const adminToken = adminRes?.data?.data?.access_token || adminRes?.data?.data?.token;
    
    if (adminToken) {
      const adminAppsRes = await axios.get(`${BASE_URL}/admin/applications`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      }).catch(e => e.response);
      console.log("Admin apps status:", adminAppsRes?.status);
      const items = adminAppsRes?.data?.data?.data || adminAppsRes?.data?.data || adminAppsRes?.data;
      let foundInAdmin = false;
      if (Array.isArray(items)) {
        foundInAdmin = items.some(a => a.id === appId);
      }
      console.log(`App ${appId} found in admin? ${foundInAdmin}`);
    }

    // 3. Employee
    console.log("\n--- Employee ---");
    const empRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'employee1@admission.test',
      password: 'password'
    }).catch(e => e.response);
    const empToken = empRes?.data?.data?.access_token || empRes?.data?.data?.token;
    
    if (empToken) {
      const empAppsRes = await axios.get(`${BASE_URL}/admission_employee/applications`, {
        headers: { Authorization: `Bearer ${empToken}` }
      }).catch(e => e.response);
      console.log("Employee apps status:", empAppsRes?.status);
      const items = empAppsRes?.data?.data?.data || empAppsRes?.data?.data || empAppsRes?.data;
      let foundInEmp = false;
      if (Array.isArray(items)) {
        foundInEmp = items.some(a => a.id === appId);
      }
      console.log(`App ${appId} found in employee? ${foundInEmp}`);
    }

    console.log(`\nFinal state: appId=${appId}, status=${appStatus}`);

  } catch (error) {
    console.error("Test failed", error.message);
  }
}

run();
