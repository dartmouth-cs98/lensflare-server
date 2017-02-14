var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');

var itemSchema = mongoose.Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true }
});
itemSchema.plugin(uniqueValidator);

var spaceSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    items: [Item]
});
spaceSchema.plugin(uniqueValidator);

var userSchema = mongoose.Schema({
    local: {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        spaces: [Space]
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

// userSchema static methods
userSchema.statics.getUser = function (email, cb) {
    return this.findOne({'local.email': new RegExp(email, 'i')}, cb);
};

userSchema.statics.removeUser = function (email, cb) {
    return this.findOneAndRemove({'local.email': new RegExp(email, 'i')}, cb);
};

userSchema.statics.updateName = function (email, name) {
    // currently set to silently fail to update if empty string provided
    if (name.length > 0) {
        this.getUser(email, function (err, user) {
            if (err) {
                console.log(err);
                throw err;
            }

            user.local.name = name;
            user.save(function (err) {
                if (err) {
                  console.log(err);
                  throw err;
                }
            });
        });
    }
};

// TEST THIS
userSchema.statics.getSpaces = function (email, cb) {
    return this.findOne({'local.email': new RegExp(email, 'i')}, 'local.spaces -_id', cb);
};

userSchema.statics.getSpace = function (email, spaceName, cb) {
    return this.getSpaces(email, function (err, spaces) {
        if (err) {
            console.log(err);
            throw err;
        }

        for (var i in spaces) {
            if (spaces[i].name == spaceName) {
                return cb(spaces[i]);
            }
        }
        return null;
    });
};

userSchema.statics.hasSpace = function (email, spaceName) {
    return this.getSpaces(email, function (err, spaces) {
        if (err) {
            console.log(err);
            throw err;
        }

        for (var i in spaces) {
            if (spaces[i].name == spaceName) {
                return true;
            }
        }
        return false;
    });
};

userSchema.statics.updateSpaces = function (email, spaces) {
    this.getUser(email, function (err, user) {
        if (err) {
            console.log(err);
            throw err;
        }

        user.local.spaces = spaces;

        user.save(function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
};

userSchema.statics.getItems = function (email, spaceName, cb) {
    return this.getSpace(email, spaceName, function (err, space) {
        if (err) {
            console.log(err);
            throw err;
        }

        return cb(space.items); 
    });
};

userSchema.statics.addItem = function (email, spaceName, url) {
    this.getSpace(email, spaceName, function (err, space) {
        if (err) {
            console.log(err);
            throw err;
        } 

        var item = new Item({
            title: "[add title]",
            text: "[add text]",
            url: url
        });
        space.items.push(item);

        space.save(function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    }); 
};

userSchema.statics.removeSpace = function (email, spaceName) {
    this.getSpaces(email, function (err, spaces) {
        if (err) {
            console.log(err);
            throw err;
        }

        for (var i in spaces) {
            if (spaces[i].name == spaceName) {
                spaces.pull(spaces[i]);
                break;
            }
        }

        user.save(function (err) {
            if (err) {
              console.log(err);
              throw err;
            }
        });
    });
};

userSchema.statics.removeItem = function (email, spaceName, url) {
    this.getItems(email, spaceName, function (err, items) {
        if (err) {
            console.log(err);
            throw err;
        } 

        for (var i in items) {
          if (items[i].url == url) {
            items.pull(items[i]);
          }
        }

        items.save(function (err) {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    }); 
};

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


module.exports = {
    'User': mongoose.model('User', userSchema);
    'Space': mongoose.model('Space', spaceSchema);
    'Item': mongoose.model('Item', itemSchema);
};