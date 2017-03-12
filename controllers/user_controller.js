import jwt from 'jwt-simple';

export const signup = (req, res, done) => {
    const email = req.body.username;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(422).send('You must provide email and password');
    }

    const User = require('../models/user');

    // check if duplicate
    User.findOne({'local.email': email}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            const newUser = new User();
            newUser.local.name = req.param('name');
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            newUser.save(function (err) {
                if (err) throw err;
                return done(null, newUser);
            });

            res.send({
                token: tokenForUser(newUser),
            });
        } else {
            res.status(409).send('Username Already Taken')
            return done(null, false);
        }
    });
};

// encodes a new token for a user object
function tokenForUser(user) {
    const timestamp = new Date().getTime();
    console.log(user);
    return jwt.encode({sub: user.id, iat: timestamp}, process.env.API_SECRET);
}