import * as UserController from '../controllers/user_controller';
import {requireAuth, requireLogin} from '../config/passport';

module.exports = function (app, passport) {
    var UserModel = require("../models/user");
    var SpaceModel = require("../models/space");

    var jwt = require('jwt-simple');
    var path = require('path');

    const S3_BUCKET = process.env.S3_BUCKET;

    function tokenForUser(user) {
        const timestamp = new Date().getTime();
        return jwt.encode({sub: user.id, iat: timestamp}, process.env.API_SECRET);
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

    app.get('/getSpaces', requireAuth, function (req, res) {
        UserModel.getSpaces(req.query.email, function (err, user) {
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
        res.send({email: req.user.local.email, token: tokenForUser(req.user)});
    });

    // needs auth
    // fe call
    app.post('/saveSpaces', function (req, res) {
        UserModel.updateSpaces(req.body.userDoc.email, req.body.userDoc.spaces);
        res.send();
    });

    // backend
    // needs auth
    app.post('/saveItem', function (req, res) {
        UserModel.addItem(req.body.userId, req.body.spaceId, req.body.url);
        res.send();
    });


    // S3 Uploading
    app.post("/sign-s3", function (req, res) {
        const s3 = new aws.S3();
        var files = req.body.files;
        var returnData = {files: []};
        // create space if doesn't exist
        files.forEach((file) => {
            s3.getSignedUrl('putObject',
                {
                    Bucket: S3_BUCKET,
                    Key: file.fileName,
                    Expires: 60,
                    ACL: 'public-read'
                },
                (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.end();
                    }
                    returnData.files.push({
                        fileName: file.fileName,
                        signedUrl: data,
                        url: util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, file.fileName)
                    });
                    UserModel.addItem(req.body.email, req.body.space, util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, file.fileName));
                });
        });
        res.write(JSON.stringify(returnData));
        res.end();
    });

};
