const express = require('express');
//const helmet = require('helmet');
const moment = require('moment');

const app = express();

//app.use(helmet());

app.get('*', (req, res) => {
  //res.set('Content-Type', 'text/html');
  //const currentTime = moment().format('MMMM Do YYYY, h:mm:ss a');
  //res.status(200).send(currentTime);
  res.set('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(process.env));
});

app.get('/env', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(process.env));
});


module.exports = app;
