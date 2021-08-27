require('mysql2/node_modules/iconv-lite').encodingExists('foo');
const request = require('supertest');

const server = require('../server');

const user = {
  username: `Username1${Date.now()}`,
  password: 'z&am5PjFeB%q(Q3X',
  email: `aaaa.${Date.now()}@hotmail.com`,
  name: 'Adam SMITH',
};

let token = {};

const usernameAndPasswordTest = (path) => {
  it('Password is required', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: user.username,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Password must be at least 8 character.', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: user.username,
        password: 'a',
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Password must be no more than 30 characters', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: user.username,
        password: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Username must be at least 3 character', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: 'a',
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Username is required', async () => {
    const res = await request(server)
      .post(path)
      .send({
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Username must be no more than 30 characters', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Username must be alphanum', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: 'asdas-*/½+',
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });
};

// Register fonctions test
describe('Register', () => {
  usernameAndPasswordTest('/authentications/register');

  it('Email must be email format', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: 'asdasdasd',
        name: user.name,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"email" must be a valid email');
  });

  it('Name must be no more than 30 characters', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
        name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      });
    expect(res.status).toBe(400);
  });

  it('Name is required', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
      });
    expect(res.status).toBe(400);
  });

  it('New valid user register', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });
    token = JSON.parse(res.text).token;
    expect(res.status).toBe(201);
  });

  it('Email must be unique', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: `dasdasdas${Date.now()}@hotmail.com`,
        name: user.name,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('E-mail address or username is used!');
  });

  it('Username must be unique', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: `dasdasdas${Date.now()}`,
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('E-mail address or username is used!');
  });
});

// Login fonctions tests
describe('Login', () => {
  usernameAndPasswordTest('/authentications/login');

  it('success login', async () => {
    const res = await request(server)
      .post('/authentications/login')
      .send({
        username: user.username,
        password: user.password,
      });
    expect(res.status).toBe(200);
  });
});

// Me fonctions test
describe('Get user info', () => {
  it('request header include \'x-accesstoken\'', async () => {
    const res = await request(server)
      .get('/authentications/me');
    expect(res.status).toBe(401);
  });

  it('The value of \'x-access token\' must belong to a valid expiration date record in the \'tokens\' table', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': 'asdasdasdasdasdasdasdasd' });
    expect(res.status).toBe(401);
  });

  it('Get user info', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': token.token_value });
    expect(res.status).toBe(200);
  });
});

describe('Update user', () => {
  it('request header include \'x-accesstoken\'', async () => {
    const res = await request(server)
      .get('/authentications/me');
    expect(res.status).toBe(401);
  });

  it('The value of \'x-access token\' must belong to a valid expiration date record in the \'tokens\' table', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': 'asdasdasdasdasdasdasdasd' });
    expect(res.status).toBe(401);
  });

  it('Password is required', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({});
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"password" is required');
  });

  it('Password must be correct', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        password: user.password + 1,
      });
    expect(res.status)
      .toBe(401);
  });

  it('New username must be at least 3 character', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        newUsername: 'a',
        password: user.password,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"newUsername" length must be at least 3 characters long');
  });

  it('New username must be no more than 30 characters', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        newUsername: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        password: user.password,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"newUsername" length must be less than or equal to 30 characters long');
  });

  it('New username must be no more than 30 characters', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        newUsername: 'asdas-*/½+',
        password: user.password,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"newUsername" must only contain alpha-numeric characters');
  });

  it('New username must be unique', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        newUsername: user.username,
        password: user.password,
      });
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('Username already using!');
  });

  it('Update username', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        newUsername: `${user.username}new`,
        password: user.password,
      });
    expect(res.status)
      .toBe(200);
  });
});
