const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.connection.on('error', function (err) {
    console.log(JSON.stringify(err, null, 4));
    process.exit(1);
});
mongoose.connection.on('connected', function () {
    console.log('Successfully connected.');
});

require('./config/passport');

app.use(express.static(path.join(__dirname, '/public')));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/views/index.html')));

const server = app.listen(process.env.PORT || 5000, function () {
    const port = server.address().port;
    console.log("App now running on port", port);
});

require('./routes/routes.js')(app);
