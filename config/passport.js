var dotenv = require('dotenv');
dotenv.config({silent: true});
//lets import some stuff
import passport from 'passport';
import LocalStrategy from 'passport-local';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import User from '../models/user';
const localOptions = {usernameField: 'email'};
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.API_SECRET,
};


export const requireAuth = passport.authenticate('jwt', {session: false});
export const requireSignin = passport.authenticate('local', {
    session: false,
    failureFlash: true,
    failureRedirect: '/',
    successRedirect: '/database'
});


const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    // Verify this email and password, call done with the user
    // if it is the correct email and password
    // otherwise, call done with false
    User.findOne({'local.email': email}, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {
            console.log("could not find user");
            return done(null, false);
        }

        // compare passwords - is `password` equal to user.password?
        user.comparePassword(password, (err, isMatch) => {
            console.log("Comparing Password");

            if (err) {
                console.log("I have an error");
                done(err);
            } else if (!isMatch) {
                console.log("Password Does Not Match");
                done(null, false);
            } else {
                done(null, user);
            }
        });
    });
});

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    // See if the user ID in the payload exists in our database
    // If it does, call 'done' with that other
    // otherwise, call done without a user object
    User.findById(payload.sub, (err, user) => {
        if (err) {
            done(err, false);
        } else if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

passport.use('jwt-login', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: "lensflare"
    },
    function (req, email, password, done) {
        User.findOne({'local.email': email}, function (err, user) {
            console.log("here")
            if (err) return done(err);
            if (!user) return done(null, false, req.flash('loginMessage', 'User not found.'));
            if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', "Incorrect password."));

            return done(null, user);
        });
    }));

passport.use(jwtLogin);
passport.use(localLogin);


// module.exports = function (passport) {
//     passport.serializeUser(function (user, done) {
//         done(null, user.id);
//     });
//
//     passport.deserializeUser(function (id, done) {
//         User.findById(id, function (err, user) {
//             done(err, user);
//         });
//     });
//
//     passport.use('local-signup', new LocalStrategy({
//             nameField: 'name',
//             emailField: 'email',
//             passwordField: 'password',
//             passReqToCallback: true
//         },
//         function (req, email, password, done) {
//             process.nextTick(function () {
//                 User.findOne({'local.email': email}, function (err, user) {
//                     if (err) return done(err);
//
//                     if (user) {
//                         return done(null, false, req.flash('signupMessage', 'That email is already being used for a user account.'));
//                     }
//
//                     else {
//                         var newUser = new User();
//                         newUser.local.name = req.param('name');
//                         newUser.local.email = email;
//                         newUser.local.password = newUser.generateHash(password);
//
//                         newUser.save(function (err) {
//                             if (err) throw err;
//                             return done(null, newUser);
//                         });
//
//                     }
//                 });
//             });
//         }));
//
//     passport.use('local-login', new LocalStrategy({
//             usernameField: 'email',
//             passwordField: 'password',
//             passReqToCallback: true
//         },
//         function (req, email, password, done) {
//             User.findOne({'local.email': email}, function (err, user) {
//                 if (err) return done(err);
//                 if (!user) return done(null, false, req.flash('loginMessage', 'User not found.'));
//                 if (!user.validPassword(password)) return done(null, false, req.flash('loginMessage', "Incorrect password."));
//
//                 return done(null, user);
//             });
//         }));
//
//     var opts = {}
//     opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
//     opts.secretOrKey = 'secret';
//     opts.issuer = 'accounts.examplesoft.com';
//     opts.audience = 'yoursite.net';
//
//     passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
//         User.findOne({id: jwt_payload.sub}, function (err, user) {
//             if (err) {
//                 return done(err, false);
//             }
//             if (user) {
//                 done(null, user);
//             } else {
//                 done(null, false);
//                 // or you could create a new account
//             }
//         });
//     }));
// };
