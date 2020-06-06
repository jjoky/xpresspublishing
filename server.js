const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use(cors());

app.use(errorHandler());

app.use(morgan('dev'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;