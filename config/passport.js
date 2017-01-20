
var ExtractJwt = require('passport-jwt').ExtractJwt;
var JwtStrategy = require('passport-jwt').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var dotenv = require('dotenv');
dotenv.config({silent: true});

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    nameField: 'name',
    emailField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({ 'local.email': email }, function(err, user) {
        if (err) return done(err);

        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already being used for a user account.'));
        }

        else {
          var newUser = new User();
          newUser.local.name = req.param('name');
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          newUser.save(function(err) {
            if (err) throw err;
            return done(null, newUser);
          });

        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' : email }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('loginMessage', 'User not found.'));
      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', "Incorrect password."));

      return done(null, user);
    });
  }));

  passport.use('jwt-login', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: "lensflare"
  },
  function(req, email, password, done) {
    User.findOne({ 'local.email' : email }, function(err, user) {
      console.log("here")
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('loginMessage', 'User not found.'));
      if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', "Incorrect password."));

      return done(null, user);
    });
  }));

};
