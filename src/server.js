import express from 'express';
import body_parser from 'body-parser';

import router from './router.js';
import pre_handlers from './pre_handlers';

import { PORT } from './constants/server';

const app = express();

app.use(body_parser.json());

pre_handlers.forEach(middleware => app.use(middleware));

app.use(router);

app.listen(
  PORT,
  () => {
    console.log(`Application run at http://localhost:${PORT}`);
  }
);
