const express = require('express');
const bodyParser = require('body-parser');
const db = require('./Config/database');
const app = express();
const router = require('./Routes/routes');
const countryController = require('./Controllers/countryList');
app.use(bodyParser.json());


// routes
app.use('/', router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`application running on port ${PORT}`)); //