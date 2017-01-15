module.exports = function (app, passport) {
    const S3_BUCKET = process.env.S3_BUCKET;

    function handleError(res, reason, message, code) {
        console.log("ERROR: " + reason);
        res.status(code || 500).json({"error": message});
    }

    function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())
            return next();

        res.redirect('/');
    }

    const util = require('util');
    const aws = require('aws-sdk');

    // Homepage Routes
    app.get('/', function (req, res) {
        res.render('index.ejs', {message: req.flash('loginMessage')});
    });

    app.post('/', passport.authenticate('local-login', {
        successRedirect: '/database',
        failureRedirect: '/',
        failureFlash: true
    }));



    // User Login Routes
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/database', isLoggedIn, function (req, res) {
        res.render('database.ejs', {
            user: req.user
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
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


    // app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect: '/',
    //     failureRedirect: '/signup',
    //     failureFlash: true
    // }));
    //
    //
    // app.post('/', passport.authenticate('local-login', {
    //     successRedirect: '/database',
    //     failureRedirect: '/',
    //     failureFlash: true
    // }));

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
