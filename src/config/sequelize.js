const database = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE : process.env.DATABASE;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const host = process.env.DATABASE_HOST;

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'mysql',
  },
  test: {
    username,
    password,
    database,
    host,
    dialect: 'mysql',
  },
  production: {
    username,
    password,
    database,
    host,
    dialect: 'mysql',
  },
};
