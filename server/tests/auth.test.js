/**
 * Authentication tests
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User.model');
const { hashPassword } = require('../utils/auth');

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test1234!',
};

// Connect to test database before tests
beforeAll(async () => {
  // Use a separate test database
  const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test-db';
  await mongoose.connect(mongoUri);
  
  // Clear users collection
  await User.deleteMany({});
});

// Disconnect from test database after tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clear users collection after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body.status).toBe('success');
      expect(response.body.user).toHaveProperty('email', testUser.email.toLowerCase());
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 400 if user already exists', async () => {
      // Create a user first
      const user = new User({
        name: testUser.username,
        username: testUser.username,
        email: testUser.email.toLowerCase(),
        password: await hashPassword(testUser.password),
      });
      await user.save();
      
      // Try to register the same user
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: testUser.email })
        .expect(400);
      
      expect(response.body.status).toBe('error');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user and return tokens', async () => {
      // Create a user first
      const user = new User({
        name: testUser.username,
        username: testUser.username,
        email: testUser.email.toLowerCase(),
        password: await hashPassword(testUser.password),
      });
      await user.save();
      
      // Login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(404);
      
      expect(response.body.status).toBe('error');
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Create a user first
      const user = new User({
        name: testUser.username,
        username: testUser.username,
        email: testUser.email.toLowerCase(),
        password: await hashPassword(testUser.password),
      });
      await user.save();
      
      // Try to login with incorrect password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
      
      expect(response.body.status).toBe('error');
    });
  });
});
