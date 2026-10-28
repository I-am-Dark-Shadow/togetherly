import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/server.js';
import User from '../src/models/User.js';

// We use the Node.js native test runner (v20+) combined with supertest
describe('Togetherly API Security & Integration Tests', () => {
    let testCookie = '';

    before(async () => {
        // Ensure we are connected to DB (server.js triggers connectDB automatically)
        // Clear out test users before starting
        await User.deleteMany({ username: /^test_sec_/ });
    });

    after(async () => {
        // Cleanup test data
        await User.deleteMany({ username: /^test_sec_/ });
        await mongoose.disconnect();
    });

    test('1. Security: Should block unauthenticated access to protected routes', async () => {
        const res = await request(app).get('/api/auth/me');
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.message, 'Unauthorized: No token provided');
    });

    test('2. Auth: Should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test_sec_user1', password: 'securepassword123' });

        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.username, 'test_sec_user1');

        // Extract the HTTPOnly cookie for subsequent tests
        const cookies = res.headers['set-cookie'];
        testCookie = cookies.find(c => c.startsWith('token='));
        assert.ok(testCookie, 'Token cookie should be set');
    });

    test('3. Auth: Should reject weak passwords based on Zod schema', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test_sec_user2', password: '123' }); // Password too short

        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /Password must be at least 8 characters/);
    });

    test('4. Security: Should prevent duplicate usernames', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test_sec_user1', password: 'securepassword123' });

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.message, 'Username is already taken');
    });

    test('5. Security: Can access protected route WITH valid HTTPOnly cookie', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', testCookie); // Simulating the browser sending the cookie

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'test_sec_user1');
    });
});