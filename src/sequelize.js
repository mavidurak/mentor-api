import Sequelize from 'sequelize';
import { development as db_config } from './config/sequelize';

const connection = new Sequelize(
  db_config.database,
  db_config.username,
  db_config.password,
  {
    host: db_config.host,
    dialect: db_config.dialect
  }
);

connection.authenticate()
  .then(() => {
    console.log('MYSQL Connection done');
  }).catch(error => console.log(error));


export default connection;
