//lets import some stuff
import passport from 'passport';
import LocalStrategy from 'passport-local';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import User from '../models/user';

const dotenv = require('dotenv');
dotenv.config({silent: true});
const localOptions = {
    usernameField: 'email',
    passwordField: "password"
};
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.API_SECRET
};

passport.use(new JwtStrategy(jwtOptions,
    function (payload, done) {
        User.findById(payload.sub, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

passport.use(new LocalStrategy(localOptions, (email, password, done) => {
    console.log("Attempting Local Login");
    // if it is the correct email and password

    // Verify this email and password, call done with the user
    User.findOne({'local.email': email}, (err, user) => {
        if (err) {
            console.log("Got an error when looking for User");
            return done(err);
        }

        if (!user) {
            console.log("Could not find user - try again");
            return done(null, false);
        }

        // compare passwords - is `password` equal to user.password?
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                console.log("Error: " + err);
                done(err);
            } else if (!isMatch) {
                // otherwise, call done with false
                console.log("Passwords do not match");
                done(null, false);
            } else {
                done(null, user);
            }
        });
    });
}));

passport.use('local-signup', new LocalStrategy({
        nameField: 'name',
        emailField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        process.nextTick(function () {
            User.findOne({'local.email': email}, function (err, user) {
                if (err) return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already being used for a user account.'));
                }

                else {
                    const newUser = new User();
                    newUser.local.name = req.param('name');
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function (err) {
                        if (err) throw err;
                        return done(null, newUser);
                    });

                }
            });
        });
    }));

export const requireAuth = passport.authenticate('jwt', {
    session: false
});
export const requireLogin = passport.authenticate('local', {
    session: false
});
