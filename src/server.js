import 'dotenv/config';
import express from 'express';
import body_parser from 'body-parser';
import cors from 'cors';
import router from './router';
import pre_handlers from './pre_handlers';
import errorHandler from './handlers/errorHandler';

const app = express();

app.use(body_parser.json());
app.use(cors());

pre_handlers.forEach((middleware) => app.use(middleware));

app.use(router);
app.use(errorHandler);

app.get('/api/health-check', (req, res) => res.status(200).send('OK'));

const server = app.listen(
  process.env.APP_PORT,
  () => {
    console.log(`Application run at http://localhost:${process.env.APP_PORT}, NODE_ENV=${process.env.NODE_ENV}`);
  },
);
module.exports = server;
