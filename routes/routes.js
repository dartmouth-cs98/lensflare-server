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
    const s3 = require('s3');

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

    app.get('/getSpacesUnauth', function (req, res) {
        UserModel.getSpaces(req.query.email, function (err, user) {
            res.send(user);
        });
    });

    app.get('/getSpace', requireAuth, function (req, res) {
        UserModel.getSpace(req.query.email, req.query.spaceName, function (err, space) {
            res.send(space);
        });
    });

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
    // route for doing bulk updates to a user's set of spaces
    app.post('/saveSpaces', function (req, res) {
        UserModel.updateSpaces(req.body.userDoc.email, req.body.userDoc.spaces);
        res.send();
    });

    // route for adding a new space to a user's set of spaces
    // app.post('/addSpace', function (req, res) {
    //     var newSpace = new Space({
    //       name: req.body.spaceName
    //     });
    //     UserModel.addSpace(req.body.userDoc.email, newSpace);
    //     res.send();
    // });

    // backend
    // needs auth
    app.post('/saveItem', function (req, res) {
        UserModel.addItem(req.body.email, req.body.space, req.body.url);
        // UserModel.addItem(req.body.userId, req.body.spaceId, req.body.url);
        res.send();
    });


    app.post('/clearSpace', function (req, res) {
        console.log(req.body);
        UserModel.removeSpace(req.body.params.email, req.body.params.space);
        res.send();
    });


    // S3 Image Uploading
    // assumes access to the relevant Space object
    app.post("/sign-s3", function (req, res) {
        console.log("In signed S3 endpoint")
        const awsS3 = new aws.S3();
        var files = req.body.files;
        var returnData = {files: []};

        // associate the space with the user if not already
        if (!UserModel.hasSpace(req.body.email, req.body.space)) { // check this
            UserModel.addSpace(req.body.email, req.body.space);
        }
        console.log("About to generate Signed URLS")
        console.log(req.body);
        console.log(req.body.files);

        var itemList = [];
        files.forEach((file) => {
            awsS3.getSignedUrl('putObject',
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
                    itemList.push(util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, file.fileName));

                    // UserModel.addItem(req.body.email, req.body.space, util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, file.fileName));
                });
        });

        UserModel.addItems(req.body.email, req.body.space, itemList, returnData, (rData) => {
            res.write(JSON.stringify(rData));
            res.end();
        });

        console.log("Done generating Signed URLS")
        console.log(returnData);

    });

    // S3 Anchor Uploading
    app.post("/upload-s3", function (req, res) {
        console.log("In S3 endpoint for uploading World Anchors");

        // create a client
        var awsS3Client = new aws.S3();
        var options = {
            s3Client: awsS3Client
        };
        var client = s3.createClient(options);

        // define parameters for uploading
        var params = {
            localFile: req.localFilePath // local path of file to upload
            s3Params: {
                Bucket: S3_BUCKET,
                Key: req.s3AnchorPath
            }
        };

        // upload
        var uploader = client.uploadFile(params);
        uploader.on('error', function(err) {
            console.error("unable to upload:", err.stack);
        });
        uploader.on('progress', function() {
            console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
        });
        uploader.on('end', function () {
            console.log("done uploading");
        });

        // save s3AnchorPath to the associated space in the database
        UserModel.updateAnchorPath(req.email, req.spaceName, req.s3AnchorPath);
        res.send(); // ???
    });

    // S3 Downloading
    app.get("/download-s3", function (req, res) {
        console.log("In signed S3 download endpoint");

        // create a client
        var awsS3Client = new aws.S3();
        var options = {
            s3Client: awsS3Client
        };
        var client = s3.createClient(options);

        // retrieve file path from database
        // var anchorPath = UserModel.getAnchorPath(req.email, req.spaceName);

        // define parameters for downloading
        var params = {
            localFile: req.localFilePath // path to which to download the file
            s3Params: {
                Bucket: S3_BUCKET,
                // Key: anchorPath
            }
        };

        // download
        var downloader = client.downloadFile(params);
        downloader.on('error', function (err) {
            console.error("unable to download:", err.stack);
        });
        downloader.on('progress', function() {
            console.log("progress", downloader.progressAmount, downloader.progressTotal);
        });
        downloader.on('end', function () {
            console.log("done downloading");
        });

        res.send(); // ???
    });
};
