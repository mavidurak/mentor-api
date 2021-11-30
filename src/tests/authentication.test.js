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
  it('Client should get 400 when request doesn\'t has password', async () => {
    const res = await request(server)
      .post(path)
      .send({
        username: user.username,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });

  it('Client should get 400 when request doesn\'t has username', async () => {
    const res = await request(server)
      .post(path)
      .send({
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });
}
// Register fonctions test
describe('Register', () => {
  usernameAndPasswordTest('/authentications/register');

  it('Clients email must be valid email format', async () => {
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

  it('Client should get 400 when request doesn\'t has name', async () => {
    const res = await request(server)
      .post('/authentications/register')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
      });
    expect(res.status).toBe(400);
  });

  it('Client should get 201 when register successfully', async () => {
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

  it('Clients email must be unique', async () => {
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

  it('Clients username must be unique', async () => {
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

  it('Client should get 200 when login successfully', async () => {
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
  it('Client should get 401 when request header doesn\'t include \'x-accesstoken\'', async () => {
    const res = await request(server)
      .get('/authentications/me');
    expect(res.status).toBe(401);
  });

  it('Client should get 401 when requested for resource doesn\'t have access', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': 'asdasdasdasdasdasdasdasd' });
    expect(res.status).toBe(401);
  });

  it('Client should get 200 when user info get successfully', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': token.token_value });
    expect(res.status).toBe(200);
  });
});

describe('Update user', () => {
  it('Client should get 401 when request header doesn\'t include \'x-accesstoken\'', async () => {
    const res = await request(server)
      .get('/authentications/me');
    expect(res.status).toBe(401);
  });

  it('Client should get 401 when requested for resource doesn\'t have access', async () => {
    const res = await request(server)
      .get('/authentications/me')
      .set({ 'x-accessToken': 'asdasdasdasdasdasdasdasd' });
    expect(res.status).toBe(401);
  });

  it('Client should get error when request doesn\'t has password', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({});
    expect(JSON.parse(res.text).errors[0].message)
      .toBe('"password" is required');
  });

  it('Client should get 401 when request has worong password', async () => {
    const res = await request(server)
      .patch('/authentications/me')
      .set({ 'x-accessToken': token.token_value })
      .send({
        password: user.password + 1,
      });
    expect(res.status)
      .toBe(401);
  });

  it('Clients new username must be unique', async () => {
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

  it('Client should get 200 when update successfully', async () => {
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
