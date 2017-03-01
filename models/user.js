var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');
var Space = require('./space.js');
var Item = require('./item')
var Device = require('./device')
var User = require('./../models/user')

var userSchema = mongoose.Schema({
    local: {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        spaces: {type: Array, 'default': []},
        devices: {type: Array, 'default': []}
    }
});

userSchema.plugin(uniqueValidator);
userSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.local.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }

        callback(null, isMatch);
    });
};

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// necessary to use email to find user initially on login
userSchema.statics.getUser = function (email, cb) {
    return this.findOne({'local.email': new RegExp(email, 'i')}, cb);
};

userSchema.statics.hasUser = function (email) {

    this.findOne({'local.email': new RegExp(email, 'i')}, (err, user) => {
        if (err) throw err;
        if (user) return true;
        return false;
    });
};

userSchema.statics.removeUser = function (userID, cb) {
    return this.findOneAndRemove({'_id': userID}, cb);
};

userSchema.statics.updateName = function (userID, name) {
    // currently set to silently fail to update if empty string provided
    if (name.length > 0) {
        this.getUser(userID, function (err, user) {
            if (err) throw err;
            user.local.name = name;
            user.save(function (err) {
                if (err) throw err;
            });
        });
    }
};

userSchema.statics.getSpaces = function (email, cb) {
    this.findOne({'local.email': email}, function (err, user) {
        cb(err, user)
    });
};


userSchema.statics.getSpaceWithToken = function (token, cb) {
    Device.getDevice(token, function (err, device) {
        if (err) throw err;
        var User = require('./user')
        if (device == null) {
            cb(err, null);
        } else {
            User.getSpace(device.userEmail, device.spaceName, function (err, user) {
                cb(err, user)
            });
        }

    });
};

userSchema.statics.getSpace = function (email, spaceName, cb) {
    this.findOne({'local.email': email}, function (err, user) {
        for (var space in user.local.spaces) {
            if (user.local.spaces[space].name == spaceName) {
                cb(err, user.local.spaces[space]);
                return;
            }
        }
        cb(err, null);
    });
};

userSchema.statics.clearSpace = function (email, spaceName, cb) {
    this.findOne({'local.email': email}, function (err, user) {
        if (err) throw err;

        for (var space in user.local.spaces) {
            if (user.local.spaces[space].name == spaceName) {
                user.local.spaces[space].items.length = 0;
                user.save((err) => {
                        cb(err);
                    }
                )
            }
        }
        cb(err);
    });
};

// userSchema.statics.hasSpace = function (email, searchSpace) {
//     console.log("In Has space");
//     this.getUser(email, function (err, user) {
//         // check by space.name instead?
//         user.local.spaces.some(function (space) {
//             console.log(space);
//             return space.equals(searchSpace); // compares by ObjectID
//         });
//     });
// };

userSchema.statics.updateSpaces = function (email, spaces) {
    this.getUser(email, function (err, user) {
        if (err) throw err;

        user.local.spaces = spaces;

        user.save(function (err) {
            if (err) throw err;
        });
    });
};

userSchema.statics.updateDevices = function (email, devices) {
    this.getUser(email, function (err, user) {
        if (err) throw err;

        user.local.devices = devices;

        user.save(function (err) {
            if (err) throw err;
        });
    });
};

userSchema.statics.addDevice = function (device) {
    var email = device.userEmail;
    this.getUser(email, function (err, user) {
        if (err) throw err;
        user.local.devices.push(device);

        user.markModified('local.devices')
        user.save(function (err) {
            if (err) throw err;
        });
    });
};

userSchema.statics.editDevice = function (email, id, name, space) {
    this.getUser(email, function (err, user) {
        if (err) throw err;
        console.log("ID" + id)
        for (var deviceInd in user.local.devices) {
          if (id == user.local.devices[deviceInd]._id) {
            console.log("HERE")
            user.local.devices[deviceInd].deviceName = name;
            user.local.devices[deviceInd].spaceName = space;
          }
        }

        user.markModified('local.devices')
        user.save(function (err) {
            if (err) throw err;
        });
    });
};

userSchema.statics.setAnchors = function (token, anchors) {
    console.log("This is the token:  " + token);
    Device.getDevice(token, function (err, device) {
        if (err) throw err;
        var User = require('./user')
        console.log(device);

        User.getUser(device.userEmail, (err, user) => {
            if (err) throw err;
            for (var space in user.local.spaces) {
                if (user.local.spaces[space].name == device.spaceName) {
                    user.local.spaces[space].anchors = anchors;
                    break;
                }
            }

            user.markModified('local.spaces');


            user.save((err) => {
                if (err) throw err;

            })
        });
        // User.getSpace(device.userEmail, device.spaceName, function (err, space) {
        //     space.anchors = anchors;
        //     space.save(function (err) {
        //         if (err) throw err;
        //     });
        // });
    });
};

userSchema.statics.addSpace = function (email, spaceName) {
    var space = new Space({
        name: spaceName
    });

    this.getUser(email, function (err, user) {
        if (err) throw err;
        user.local.spaces.push(space);
        user.save(function (err) {
            if (err) throw err;
        });
    });
};

userSchema.statics.addItems = function (email, spaceName, urls, returnData, cb) {
    this.getUser(email, function (err, user) {
        for (var i in urls) {
            var url = urls[i];
            console.log("Saving " + url);
            if (err) throw err;
            for (var space in user.local.spaces) {
                var alreadyThere = false;
                if (user.local.spaces[space].name == spaceName) {
                    console.log(user.local.spaces[space].name + "Space Items: ");
                    for (var i in user.local.spaces[space].items) {
                        console.log("THe URL is: " + user.local.spaces[space].items[i].url);
                        if (user.local.spaces[space].items[i].url == url) {
                            console.log("found duplicate " + url);
                            alreadyThere = true;
                            break;
                        }
                    }
                    if (!alreadyThere) {
                        user.local.spaces[space].items.push(new Item({
                            title: "[add title]",
                            text: "[add text]",
                            url: url
                        }));
                    }
                }
            }
        }

        user.markModified('local.spaces')
        user.save(function (err) {
            if (err) {
                cb(returnData);
                throw err;
            }
            cb(returnData);
        });
    });
};

userSchema.statics.removeSpace = function (email, space) {
    console.log("Removing the Sapce");
    this.getUser(email, function (err, user) {
        if (err) throw err;
        console.log(space);
        for (var s = 0; s < user.local.spaces.length; s++) {
            if (user.local.spaces[s].name == space) {
                console.log("Foudn the space to be reomoved");
                user.local.spaces.splice(s, 1);
                break;
            }
        }
        user.save(function (err) {
            if (err) throw err;
        });
    });
}

userSchema.statics.removeSpaceById = function (email, id) {
    console.log("Removing the Sapce");
    this.getUser(email, function (err, user) {
        if (err) throw err;

        for (var s = 0; s < user.local.spaces.length; s++) {
            if (user.local.spaces[s]._id == id) {
                console.log("Foudn the space to be reomoved");
                user.local.spaces.splice(s, 1);
                break;
            }
        }
        user.save(function (err) {
            if (err) throw err;
        });
    });
}

userSchema.pre("save", function beforeUserSave(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        // hash (encrypt) our password using the salt
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) {
                return next(err);
            }
            // overwrite plain text password with encrypted password
            user.password = hash;
            return next();
        });
    });

});

module.exports = mongoose.model('User', userSchema);
