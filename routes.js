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

router.post("/sign-s3", function (req, res) {
    const s3 = new aws.S3();
    var fileName = req.body.image.name;
    var s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        type: 'POST',
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
module.exports = router;
