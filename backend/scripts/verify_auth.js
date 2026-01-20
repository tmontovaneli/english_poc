// Node 22 has global fetch


const BASE_URL = 'http://localhost:3000/api';
const API_KEY = 'system_key_1';

async function testAuth() {
    console.log('--- Starting Auth Verification ---');
    let errors = 0;

    // 1. Public Access (should fail)
    try {
        const res = await fetch(`${BASE_URL}/students`);
        if (res.status === 401) {
            console.log('✅ Public access denied (401) as expected.');
        } else {
            console.log(`❌ Public access failed: Expected 401, got ${res.status}`);
            errors++;
        }
    } catch (err) {
        console.log('❌ Public access error:', err.message);
        errors++;
    }

    // 2. Register User
    let token = '';
    const uniqueUser = `testuser_${Date.now()}`;
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: uniqueUser, password: 'password123' })
        });
        const data = await res.json();
        if (res.status === 201 && data.token) {
            token = data.token;
            console.log('✅ User registration successful.');
        } else {
            console.log(`❌ User registration failed: ${res.status} - ${JSON.stringify(data)}`);
            errors++;
        }
    } catch (err) {
        console.log('❌ Registration error:', err.message);
        errors++;
    }

    // 3. Authenticated Access (JWT)
    if (token) {
        try {
            const res = await fetch(`${BASE_URL}/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                console.log('✅ JWT Access successful (200).');
            } else {
                console.log(`❌ JWT Access failed: Expected 200, got ${res.status}`);
                errors++;
            }
        } catch (err) {
            console.log('❌ JWT Access error:', err.message);
            errors++;
        }
    }

    // 4. API Key Access
    try {
        const res = await fetch(`${BASE_URL}/students`, {
            headers: { 'x-api-key': API_KEY }
        });
        if (res.status === 200) {
            console.log('✅ API Key Access successful (200).');
        } else {
            console.log(`❌ API Key Access failed: Expected 200, got ${res.status}`);
            errors++;
        }
    } catch (err) {
        console.log('❌ API Key Access error:', err.message);
        errors++;
    }

    // 5. Invalid API Key
    try {
        const res = await fetch(`${BASE_URL}/students`, {
            headers: { 'x-api-key': 'WRONG_KEY' }
        });
        if (res.status === 401) {
            console.log('✅ Invalid API Key denied (401) as expected.');
        } else {
            console.log(`❌ Invalid API Key failed: Expected 401, got ${res.status}`);
            errors++;
        }
    } catch (err) {
        console.log('❌ Invalid API Key error:', err.message);
        errors++;
    }

    console.log(`--- Verification Complete. Errors: ${errors} ---`);
    if (errors > 0) process.exit(1);
}

testAuth();
