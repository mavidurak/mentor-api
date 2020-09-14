const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const host = process.env.HOST;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  },
  test: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  },
  production: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  }
};
