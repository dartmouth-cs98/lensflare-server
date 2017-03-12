import * as UserController from '../controllers/user_controller';
import {requireAuth, requireLogin} from '../config/passport';

module.exports = function (app) {
    const UserModel = require("../models/user");
    const DeviceModel = require("../models/device");

    const jwt = require('jwt-simple');
    const path = require('path');

    const S3_BUCKET = process.env.S3_BUCKET;

    function tokenForUser(user) {
        const timestamp = new Date().getTime();
        return jwt.encode({sub: user.id, iat: timestamp}, process.env.API_SECRET);
    }

    const util = require('util');
    const aws = require('aws-sdk');

    //////////////////////////////////////////////////////////////////////////////
    // Page Rendering Endpoints
    //////////////////////////////////////////////////////////////////////////////

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/index.html'));
    });

    app.get('/help', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/help.html'));
    });

    app.get('/signup', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/signup.html'));
    });

    app.get('/database', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/views/database.html'));
    });

    //////////////////////////////////////////////////////////////////////////////
    // FE Endpoints
    //////////////////////////////////////////////////////////////////////////////

    app.get('/getSpaces', requireAuth, function (req, res) {
        UserModel.getSpaces(req.query.email, function (err, user) {
            res.send(user);
        });
    });

    app.get('/getSpace', requireAuth, function (req, res) {
        UserModel.getSpace(req.query.email, req.query.spaceName, function (err, space) {
            res.send(space);
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
    app.post('/signup', UserController.signup);

    // Login/ FE Auth
    app.post('/jwt', requireLogin, function (req, res) {
        res.send({email: req.user.local.email, token: tokenForUser(req.user)});
    });

    // fe call
    // route for doing bulk updates to a user's set of spaces
    app.post('/saveSpaces', requireAuth, function (req, res) {
        UserModel.updateSpaces(req.body.userDoc.email, req.body.userDoc.spaces);
        res.send();
    });

    app.post('/saveDevices', requireAuth, function (req, res) {
        UserModel.updateDevices(req.body.userDoc.email, req.body.userDoc.devices);
        res.send();
    });

    // backend
    app.post('/saveItem', requireAuth, function (req, res) {
        const returnData = {files: []};
        UserModel.addItems(req.body.email, req.body.space, [req.body.url], returnData, (rData) => {
            res.send();
        });
        res.send();
    });

    app.post('/clearSpace', requireAuth, function (req, res) {
        console.log(req.body);
        UserModel.removeSpace(req.body.params.email, req.body.params.space);
        res.send();
    });

    app.post('/clearSpaceById', requireAuth, function (req, res) {
        console.log(req.body);
        UserModel.removeSpaceById(req.body.params.email, req.body.params.id);
        res.send();
    });

    //////////////////////////////////////////////////////////////////////////////
    // DEVICE REGISTRATION ENDPOINTS
    //////////////////////////////////////////////////////////////////////////////

    app.post('/generateDeviceId', requireAuth, function (req, res) {
        const newDevice = new DeviceModel();

        // validate the email
        // if (UserModel.hasUser(req.body.params.userEmail)) {
        newDevice.deviceName = req.body.params.deviceName;
        newDevice.spaceName = req.body.params.spaceName;
        newDevice.userEmail = req.body.params.userEmail;
        newDevice.save((err) => {
            if (err) {
                console.log(err);
                throw err;
            }

            UserModel.addDevice(newDevice);
            res.write(JSON.stringify("{ \"deviceToken\": \"" + newDevice.id + "\" }"));
            res.send();
        });
    });

    app.post('/editDevice', requireAuth, function (req, res) {
        UserModel.editDevice(req.body.params.email, req.body.params.deviceId, req.body.params.name, req.body.params.space, (err) => {
                if (err) throw err;
            }
        );
        res.send();
    });

    //////////////////////////////////////////////////////////////////////////////
    // HoloLens Endpoints
    //////////////////////////////////////////////////////////////////////////////

    app.get('/getSpaceWithToken', function (req, res) {
        if (req.query.token == null) {
            res.status(400);
            res.end();
            return;
        }
        console.log(req.query.token);
        // need to do something if the token is no longer valid
        UserModel.getSpaceWithToken(req.query.token, function (err, user) {
            if (err) throw err;

            if (user == null) {
                console.log("No user doc was not found with the token " + req.query.token);
                res.status(401);
            }
            res.send(user);
        });
    });

    app.post('/clearSpace', function (req, res) {
        console.log(req.body);
        UserModel.removeSpace(req.body.params.email, req.body.params.space);
        res.send();
    });

    app.post("/addAnchors", function (req, res) {
        UserModel.setAnchors(req.body.token, req.body.anchors);
        res.send();
    });

    app.post('/setAnchors', function (req, res) {
        console.log(req.body);
        UserModel.setAnchors(req.body.token, req.body.anchors);
        res.send();
    });

    // S3 Uploading
    // assumes access to the relevant Space object
    app.post("/sign-s3-photos", function (req, res) {
        const s3 = new aws.S3();
        const files = req.body.files;
        const returnData = {files: []};
        if (req.body.token == null) {
            res.status(400);
            res.end();
        }

        // associate the space with the user if not already
        DeviceModel.getDevice(req.body.token, (err, device) => {
            if (err) throw err;

            if (device == null) {
                res.status(401);
                res.end();
            }

            UserModel.clearSpace(device.userEmail, device.spaceName, (err) => {
                let itemList = [];
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
                        });
                });
                UserModel.addItems(device.userEmail, device.spaceName, itemList, returnData, (rData) => {
                    res.write(JSON.stringify(rData));
                    res.end();
                });
            });
        });

    });

    app.post("/sign-s3", function (req, res) {
        const s3 = new aws.S3();
        s3.getSignedUrl('putObject',
            {
                Bucket: S3_BUCKET,
                Key: req.body.file,
                Expires: 60,
                ACL: 'public-read'
            },
            (err, data) => {
                if (err) throw err;


                const rData = {
                    signedUrl: data,
                    url: util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, req.body.file),
                    fileName: req.body.file
                };

                res.write(JSON.stringify(rData));
                res.end();

            });
    });

};
