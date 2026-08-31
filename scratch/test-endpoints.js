async function run() {
  const loginRes = await fetch('https://university-admission-backend.onrender.com/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'yeheashorafa6@gmail.com', password: 'password' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  
  console.log('Token extracted:', token ? 'YES' : 'NO');
  
  if (!token) {
    console.log('Login failed', JSON.stringify(loginData, null, 2));
    return;
  }

  const authMeRes = await fetch('https://university-admission-backend.onrender.com/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const authMeData = await authMeRes.json();
  console.log('--- Auth Me Response ---');
  console.log(JSON.stringify(authMeData, null, 2));

  const profileRes = await fetch('https://university-admission-backend.onrender.com/api/v1/student/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profileData = await profileRes.json();
  console.log('--- Profile Response ---');
  console.log(JSON.stringify(profileData, null, 2));
}
run().catch(console.error);
