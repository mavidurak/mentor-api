import express from 'express';
import body_parser from 'body-parser';
import cors from 'cors';

import router from './router.js';
import pre_handlers from './pre_handlers';

import { PORT } from './constants/server';

const app = express();

app.use(body_parser.json());
app.use(cors());

pre_handlers.forEach(middleware => app.use(middleware));

app.use(router);

app.listen(
  PORT,
  () => {
    console.log(`Application run at http://localhost:${PORT}`);
  }
);
