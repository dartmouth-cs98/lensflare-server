const S3_BUCKET = process.env.S3_BUCKET;

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

const util = require('util');
const router = require('express').Router();
const aws = require('aws-sdk');

// module.exports()
// {
//     'use strict';
// Generic error handler used by all endpoints.

// add a new user (as of now, JSON should include all object info)
router.post("/users", function (req, res) {
    var newUser = req.body;
    newUser.createDate = new Date();

    // sanitize input
    db.collection(USERS_COLLECTION).insertOne(newContact, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to create new user.");
        } else {
            res.status(201).json(doc.ops[0]);
        }
    });

});

// get all users - will include display text?
router.get("/users", function (req, res) {
    db.collection(USERS_COLLECTION).find({}).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get users.");
        } else {
            res.status(200).json(docs);
        }
    });
});

// Get a full user structure by ID
router.get("/users/:id", function (req, res) {
    db.collection(USERS_COLLECTION).findOne({_id: new ObjectID(req.params.id)}, function (err, doc) {
        if (err) {
            handleError(res, err.message, "Failed to get user");
        } else {
            res.status(200).json(doc);
        }
    });
});

// delete a user
router.delete("/users/:id", function (req, res) {
    db.collection(USERS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function (err, result) {
        if (err) {
            handleError(res, err.message, "Failed to delete contact");
        } else {
            res.status(204).end();
        }
    });
});

router.get("/sign-s3", function (req, res) {
    console.log("About to hit S3");
    const s3 = new aws.S3();
    var return_list = [];
    console.log(req.body.image_infos);
    req.body.image_infos.forEach(function (image) {
        console.log("image is " + image);
        var imageName = image.name;
        var fileType = image.type;
        var s3Params = {
            Bucket: S3_BUCKET,
            Key: imageName,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {
                console.log(err);
                return res.end();
            }
            var returnData = {
                imageName: imageName,
                signedRequest: data,
                url: util.format('https://%s.s3.amazonaws.com/%s', S3_BUCKET, imageName)
        }
            return_list.push(returnData);
            // save it in the DB;
        });
    });
    res.write(JSON.stringify(return_list));
    res.end();
});
module.exports = router;
