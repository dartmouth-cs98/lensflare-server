import * as UserController from '../controllers/user_controller';
import {requireAuth, requireLogin} from '../config/passport';

module.exports = function (app, passport) {
    var UserModel = require("../models/user");
    var SpaceModel = require("../models/space");
    var DeviceModel = require("../models/device");

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

    ////////////////////////// DEVICE REGISTRATION
    // need user email and space Name
    app.post('/registerDevice', function (req, res) {
        var newDevice = new DeviceModel();
        // validate the email
        if (UserModel.hasUser(req.body.userEmail)) {
            newDevice.deviceName = req.body.deviceName;
            newDevice.spaceName = req.body.spaceName;
            newDevice.userEmail = req.body.userEmail;
            newDevice.save((err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                UserModel.addDevice(newDevice.userEmail, newDevice.id);
                res.write(JSON.stringify("{ \"deviceToken\": \"\"" + newDevice.id + "\" }"));
                res.send();
            });
        } else {
            res.status(400).send("User could not be found");
        }
    });

    app.post('/setDeviceSpace', function (req, res) {
        if (UserModel.hasSpace(req.userEmail, req.spaceName)) {
            DeviceModel.setSpace(req.deviceId, req.spaceName, (err) => {
                    if (err) throw err;
                    res.send();
                }
            );
        }
        res.status(400).send("Space could not be found");
    });
    /////////////////////// END DEVICE REGISTRATION

    app.post('/clearSpace', function (req, res) {
        console.log(req.body);
        UserModel.removeSpace(req.body.params.email, req.body.params.space);
        res.send();
    });


    // S3 Uploading
    // assumes access to the relevant Space object
    app.post("/sign-s3", function (req, res) {
        console.log("In Signed s3 endpoint")
        const s3 = new aws.S3();
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

};
