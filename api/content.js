
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const yuuvis = require('../lib/yuuvis');

app.get('*', async (req, res, next) => {
    resp.send(yuuvis.content(req.query.id));
});