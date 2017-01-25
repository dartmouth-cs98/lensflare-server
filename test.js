var mongoose = require('mongoose');
var User = require('./models/user');
var router = require('express').Router();

var uri = 'mongodb://lensflare:L3nsflar3@ds117849.mlab.com:17849/lensflare';

mongoose.Promise = global.Promise;
var db = mongoose.connect(uri);

mongoose.connection.on('connected', function() {
  console.log('Successfully connected.');
});

mongoose.connection.on('error', function(err) {
  console.log(JSON.stringify(err, null, 4));
  process.exit(1);
});

mongoose.connection.on('disconnected', function() {
  console.log('Successfully disconnected.');
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Process interrupted. Mongoose connection closed.');
    process.exit(0);
  });
});

router.get('/users/:id', function(req, res) {
  models.User.findOne({ username: req.username }, function (err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res, null, 4)); 
  });
});

router.post('/users/:id', function (req, res) {
  var newUser = new models.User({
    name: req.name,
    username: req.username,
    museums: req.museums
  });

  newUser.save(function (err, users) {
    if (err) throw err;
    console.log(users);
  });
});

router.put('/users/:id', function (req, res) {
  models.User.findOne({ username: req.username }, function (err, user) {
    if (err) throw err;
    // HOW BEST TO DO THIS???
    user.museums = req.museums;
    user.save(function (err, upd) {
      if (err) throw err;
      res.send(upd);
    });
  });
});

router.delete('/users/:id', function(req, res) {
  models.User.findOneAndRemove({ username: req.username }, function (err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res, null, 4));
  });
});

/*
// Creating one user.
var user = new models.User ({
  name: 'test',
  username: 'test'
});

// Saving it to the database.
user.save(function (err) {
  if (err) throw err;
  console.log ('User saved successfully!');
});
*/
User.getUser('nick', function (err, user) {
  if (err) console.log(user);
  console.log(user);
});