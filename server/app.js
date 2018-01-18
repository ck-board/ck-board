const path = require('path');

// load environment variables
require('dotenv').config({
  path: path.resolve(`./src/env/.env.${process.env.NODE_ENV}`)
});

const express = require('express');
const app = express();

const port = process.env.PORT || 4000;

const morgan = require('morgan');

const jwtMiddleware = require('./src/middlewares/jwtMiddleware');
const api = require('./src/routes');

// db connection
require('./src/db/index');

// default middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(jwtMiddleware);

// api endpoints
app.use('/api', api);

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});