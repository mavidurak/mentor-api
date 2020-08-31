const database = 'mavidurak';
const username = 'newuser';
const password = 'ads345';
const host = 'localhost';
const port = '3306';


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
