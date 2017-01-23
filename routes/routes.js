import * as UserController from '../controllers/user_controller';
import {requireAuth, requireLogin} from '../config/passport';

module.exports = function (app, passport) {
    var UserModel = require("../models/user");

    var jwt = require('jwt-simple');
    var path = require('path');
    //
    // function handleError(res, reason, message, code) {
    //     console.log("ERROR: " + reason);
    //     res.status(code || 500).json({"error": message});
    // }
    //
    // function isLoggedIn(req, res, next) {
    //     if (req.isAuthenticated())
    //         return next();
    // }

    const S3_BUCKET = process.env.S3_BUCKET;


    function tokenForUser(user) {
        const timestamp = new Date().getTime();
        return jwt.encode({sub: user.id, iat: timestamp}, "lensflare");
    }

    const util = require('util');
    const aws = require('aws-sdk');

    // Page Rendering
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/index.html'));
    });

    app.get('/signup', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/signup.html'));
    });

    app.get('/database', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/database.html'));
    });

    app.get('/getSpaces', function (req, res) {
      UserModel.getSpaces(req.query.email, function(err, user) {
        res.send(user);
      });
    });

    // Does this work?? who knows
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });


    //--------------------------------------------------------------------------------------------

    app.post('/signup', UserController.signup);

    // Login/ FE Auth
    app.post('/jwt', requireLogin, function (req, res) {
        res.send({email: req.user.local.email, email: req.user.local.email, token: tokenForUser(req.user)});
    });

    app.post('/saveSpaces', function (req, res) {
        UserModel.updateSpaces(req.body.email, req.body.spaces)
    });


    // S3 Uploading
    app.post("/sign-s3", function (req, res) {
        console.log("Generating Signed URL");
        const s3 = new aws.S3();
        var fileName = req.body.image.name;
        var s3Params = {
            Bucket: S3_BUCKET,
            Key: fileName,
            Expires: 60,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {
                console.log(err);
                return res.end();
            }
            console.log(fileName);
            var returnData = {
                fileName: fileName,
                signedUrl: data,
                url: util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, fileName)
            }

            console.log(returnData.signedUrl);

            res.write(JSON.stringify(returnData));
            // save it in the DB;

        });
        res.end();
    });


//
//     // add a new user (as of now, JSON should include all object info)
//     app.post("/users", function (req, res) {
//         var newUser = req.body;
//         newUser.createDate = new Date();
//
//         // sanitize input
//         db.collection(USERS_COLLECTION).insertOne(newContact, function (err, doc) {
//             if (err) {
//                 handleError(res, err.message, "Failed to create new user.");
//             } else {
//                 res.status(201).json(doc.ops[0]);
//             }
//         });
//
//     });
//
// // get all users - will include display text?
//     app.get("/users", function (req, res) {
//         db.collection(USERS_COLLECTION).find({}).toArray(function (err, docs) {
//             if (err) {
//                 handleError(res, err.message, "Failed to get users.");
//             } else {
//                 res.status(200).json(docs);
//             }
//         });
//     });
//
// // Get a full user structure by ID
//     app.get("/users/:id", function (req, res) {
//         db.collection(USERS_COLLECTION).findOne({_id: new ObjectID(req.params.id)}, function (err, doc) {
//             if (err) {
//                 handleError(res, err.message, "Failed to get user");
//             } else {
//                 res.status(200).json(doc);
//             }
//         });
//     });
//
// // delete a user
//     app.delete("/users/:id", function (req, res) {
//         db.collection(USERS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
//             if (err) {
//                 handleError(res, err.message, "Failed to delete contact");
//             } else {
//                 res.status(204).end();
//             }
//         });
//     });

}
