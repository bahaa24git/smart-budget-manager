const request = require('supertest');
const app = require('../server');
const chai = require('chai');
const expect = chai.expect;

let authToken = ''; // Moved outside to share across describe blocks
let testUserId = null;
let testWalletId = null;

describe('User Authentication Routes', () => {

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
    authToken = res.body.token;
    testUserId = res.body.user.id || res.body.user.UserID || 1; // Adjust depending on your API response
  });

  it('should create a new wallet when logged in', async () => {
    const res = await request(app)
      .post('/wallets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userId: testUserId,
        name: 'Test Wallet',
        balance: 1000
      });

    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal('Test Wallet');
    testWalletId = res.body.id; // Save for use in transaction tests
  });

  it('should not create a wallet without a token', async () => {
    const res = await request(app)
      .post('/wallets')
      .send({
        userId: testUserId,
        name: 'Unauthorized Wallet',
        balance: 1000
      });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.match(/token/i);
  });
});

describe('Transaction Routes', () => {
  it('should create a new transaction', async () => {
    const res = await request(app)
      .post('/transactions/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userID: testUserId,
        amount: 200,
        description: 'Test Transaction',
        category: 'Test',
        date: new Date().toISOString(),
        budgetID: 1,
        walletID: testWalletId
      });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.match(/success/i);
  });

  it('should not allow transaction creation without a token', async () => {
    const res = await request(app)
      .post('/transactions/add')
      .send({
        userID: testUserId,
        amount: 200,
        description: 'Test Transaction',
        category: 'Test',
        date: new Date().toISOString(),
        budgetID: 1,
        walletID: testWalletId
      });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.match(/token/i);
  });
});