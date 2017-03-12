const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();
const path = require("path");
require('./config/passport');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.json());

const uri = 'mongodb://lensflare:L3nsflar3@lensflare-shard-00-00-5bldu.mongodb.net:27017/,lensflare-shard-00-01-5bldu.mongodb.net:27017,lensflare-shard-00-02-5bldu.mongodb.net:27017/lensflare?ssl=true&replicaSet=Lensflare-shard-0&authSource=admin';
mongoose.Promise = global.Promise;
mongoose.connect(uri);
mongoose.connection.on('error', function (err) {
    console.log(JSON.stringify(err, null, 4));
    process.exit(1);
});
mongoose.connection.on('connected', function () {
    console.log('Successfully connected.');
});

const server = app.listen(process.env.PORT || 5000, function () {
    const port = server.address().port;
    console.log("App now running on port", port);
});

require('./routes/routes.js')(app, passport);
