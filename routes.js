const S3_BUCKET = process.env.S3_BUCKET;

module.exports(app) {
	// Generic error handler used by all endpoints.
	function handleError(res, reason, message, code) {
	  console.log("ERROR: " + reason);
	  res.status(code || 500).json({"error": message});
	}

	// add a new user (as of now, JSON should include all object info)
	app.post("/users", function(req, res) {
		var newUser = req.body;
		newUser.createDate = new Date();

		// sanitize input
		db.collection(USERS_COLLECTION).insertOne(newContact, function(err, doc) {
		    if (err) {
		      handleError(res, err.message, "Failed to create new user.");
		    } else {
		      res.status(201).json(doc.ops[0]);
		    }
	  	});

	}); 

	// get all users - will include display text? 
	app.get("/users", function(req, res) {
	  db.collection(USERS_COLLECTION).find({}).toArray(function(err, docs) {
	    if (err) {
	      handleError(res, err.message, "Failed to get users.");
	    } else {
	      res.status(200).json(docs);
	    }
	  });
	}); 

	// Get a full user structure by ID
	app.get("/users/:id", function(req, res) {
		db.collection(USERS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
		    if (err) {
		      handleError(res, err.message, "Failed to get user");
		    } else {
		      res.status(200).json(doc);
		    }
		});
	}); 

	// delete a user
	app.delete("/users/:id", function(req, res){
	  db.collection(USERS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
	    if (err) {
	      handleError(res, err.message, "Failed to delete contact");
	    } else {
	      res.status(204).end();
	    }
	  });
	});


	app.get("/sign-s3", function(req, res) {
		const s3 = new aws.S3();
		var return_list = [];
		for (var image in res.image_infos) {
			var imageName = image.name;
			var fileType = image.type; 

			const s3Params = {
			    Bucket: S3_BUCKET,
			    Key: imageName,
			    Expires: 60,
			    ContentType: fileType,
			    ACL: 'public-read'
			};

		    s3.getSignedUrl('putObject', s3Params, (err, data) => {
			    if(err){
			      console.log(err);
			      return res.end();
			    }
			    const returnData = {
			      imageName: imageName,
			      signedRequest: data,
			      url: 'https://${S3_BUCKET}.s3.amazonaws.com/${fileName}'
			    };
			    return_list.push(returnData);
			    // save it in the DB;
		  	});

		}
		res.write(JSON.stringify(return_list));
		res.end();
	});
}