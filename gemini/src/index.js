const express = require('express');
const dotenv = require('dotenv').config();
var bodyParser = require('body-parser')
const routes = require('./routes');
const app = express();
const port = process.env.PORT;
const serverless = require('serverless-http');

// parse various different custom JSON types as JSON
app.use(bodyParser.json())
app.use(routes);
app.listen(port, () => console.log(`Quickstart app listening at http://localhost:${port}`))

//module.exports.handler = serverless(app);
