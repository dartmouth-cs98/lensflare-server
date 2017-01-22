var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var USERS_COLLECTION = "users";

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var uri = 'mongodb://lensflare:L3nsflar3@lensflare-shard-00-00-5bldu.mongodb.net:27017/,lensflare-shard-00-01-5bldu.mongodb.net:27017,lensflare-shard-00-02-5bldu.mongodb.net:27017/lensflare?ssl=true&replicaSet=Lensflare-shard-0&authSource=admin';
mongoose.Promise = global.Promise;
var db = mongoose.connect(uri);
mongoose.connection.on('error', function (err) {
    console.log(JSON.stringify(err, null, 4));
    process.exit(1);
});
mongoose.connection.on('connected', function () {
    console.log('Successfully connected.');
});

require('./config/passport');

// app.use(express.static(__dirname + '/public/style'));
// app.use(express.static(__dirname + '/public/assets'));
// app.use(express.static(__dirname + '/public/scripts'));
// app.use(express.static(__dirname + '/public/views'));

app.use(express.static(path.join(__dirname, '/public')));


app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.set('view engine', 'ejs');

// app.use(session({secret: 'lensflare'}));
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(flash());

app.use(express.static(path.join(__dirname, '/views/index.html')));


var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


require('./routes/routes.js')(app, passport);


// mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
//     if (err) {
//         console.log(err);
//         process.exit(1);
//     }
//
//     // Save database object from the callback for reuse.
//     db = database;
//     console.log("Database connection ready");
//
//     // Initialize the app.
//     var server = app.listen(process.env.PORT || 8080, function () {
//         var port = server.address().port;
//         console.log("App now running on port", port);
//     });
// });
//
