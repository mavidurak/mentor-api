require('mysql2/node_modules/iconv-lite').encodingExists('foo');
const request = require('supertest');
const server = require('../server');
const User = require('../models/user');

/* import supertest from 'supertest';
const request = supertest(process.env.BACKEND_PATH); */

const user = {
  username: 'aaaa',
  password: 'aaaaaaaa',
  email: 'aaaa@hotmail.com',
  name: 'aaaa aaaa bbbb',
};

describe('Register', () => {
  it('New true user register', async () => {
    const res = await request(server)
      .post('/authentications/register/')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(201);
  });
});

describe('Register', () => {
  it('Register error', async () => {
    const res = await request(server)
      .post('/authentications/register/')
      .send({
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });
    expect(res.status).toBe(400);
  });
});

describe('Login', () => {
  it('/authentications/login/', async () => {
    const res = await request(server)
      .post('/authentications/login')
      .send({
        username: user.username,
        password: user.password,
      });
    expect(res.status).toBe(200);
  });
});
