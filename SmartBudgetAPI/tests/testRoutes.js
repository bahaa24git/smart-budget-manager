const request = require('supertest');
const app = require('../server'); // Now it's pointing to server.js
const chai = require('chai');
const expect = chai.expect;

describe('User Authentication Routes', () => {
  
  let authToken = ''; // Variable to store the JWT token

  // Test: Register a new user
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword123',
        email: 'testuser@example.com'
      });
    
    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal('User registered successfully');
  });

  // Test: Login and get the token
  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword123'
      });
    
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('User logged in successfully');
    expect(res.body.token).to.be.a('string');
    authToken = res.body.token; // Store the token for future tests
  });

  // Test: Create a new wallet (protected route)
  it('should create a new wallet when logged in', async () => {
    const res = await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`) // Pass the JWT token in the Authorization header
      .send({
        walletName: 'Test Wallet',
        balance: 1000
      });
    
    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal('Wallet created successfully');
  });

  // Test: Try to create a wallet without being logged in (should fail)
  it('should not create a wallet without a token', async () => {
    const res = await request(app)
      .post('/wallets')
      .send({
        walletName: 'Unauthorized Wallet',
        balance: 1000
      });
    
    expect(res.status).to.equal(401); // Unauthorized
    expect(res.body.message).to.equal('No token, authorization denied');
  });
});

describe('Transaction Routes', () => {

  let authToken = ''; // Variable to store the JWT token for transactions

  // Test: Create a transaction (protected route)
  it('should create a new transaction', async () => {
    const res = await request(app)
      .post('/transactions/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        amount: 200,
        description: 'Test Transaction',
        walletId: 1
      });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal('Transaction created successfully');
  });

  // Test: Unauthorized transaction attempt
  it('should not allow transaction creation without a token', async () => {
    const res = await request(app)
      .post('/transactions/add')
      .send({
        amount: 200,
        description: 'Test Transaction',
        walletId: 1
      });

    expect(res.status).to.equal(401); // Unauthorized
    expect(res.body.message).to.equal('No token, authorization denied');
  });
});