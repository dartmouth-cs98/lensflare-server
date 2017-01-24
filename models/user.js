var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');
var Space = require('./space.js');
var Item = require('./item')

var userSchema = mongoose.Schema({
  local: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    spaces: { type: Array, 'default': [] }
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
  return this.find({ 'local.email': new RegExp(email, 'i') }, cb);
};

// userSchema.statics.getSpaces = function (email, cb) {
//   return this.find({ 'local.email': new RegExp(email, 'i') }, 'spaces -_id', cb);
// };

userSchema.statics.removeUser = function (userID, cb) {
  return this.findOneAndRemove({ '_id': userID }, cb);
};

userSchema.statics.updateName = function(userID, name) {
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

userSchema.statics.getSpaces = function(email, cb) {
  this.findOne({ 'local.email': email }, function (err, user) {
    cb(err, user)
  });
};

userSchema.statics.updateSpaces = function(email, spaces) {
  this.findOne({ 'local.email': email}, function (err, user) {
    if (err) throw err;

    user.local.spaces = spaces;

    user.save(function(err) {
      if (err) throw err;
    });
  });
};

userSchema.statics.addSpace = function(email, spaceName) {
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

userSchema.statics.addItem = function(email, spaceName, url) {
  this.findOne({ 'local.email': email }, function (err, user) {
    if (err) throw err;

    for (var space in user.local.spaces) {
      if (user.local.spaces[space].name == spaceName) {
        user.local.spaces[space].items.push(new Item({
          title: "[add title]",
          text: "[add text]",
          url: url
        }));
      }
    }

    user.markModified('local.spaces')

    user.save(function (err) {
      if (err) throw err;
    });

  });
};

userSchema.statics.removeSpace = function(email, space) {
  this.getUser(email, function (err, user) {
    if (err) throw err;
    user.local.spaces.pull(space);
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
