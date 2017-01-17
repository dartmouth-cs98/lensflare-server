var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var bcrypt = require('bcrypt-nodejs');

var Space = require('./space.js');

var userSchema = mongoose.Schema({
  local: {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    spaces: { type: Array, 'default': [] }
  }
});
userSchema.plugin(uniqueValidator);

userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.statics.getUser = function (email, cb) {
  return this.find({ email: new RegExp(email, 'i')}, cb);
};

userSchema.statics.getSpaces = function (email, cb) {
  return this.find({ email: new RegExp(email, 'i') }, 'spaces -_id', cb);
};

userSchema.statics.removeUser = function (email, cb) {
  return this.findOneAndRemove({ email: new RegExp(email, 'i') }, cb);
};

userSchema.statics.updateName = function(email, name) {
  // currently set to silently fail to update if empty string provided
  if (name.length > 0) {
    this.getUser(email, function (err, user) {
      if (err) throw err;
      user.local.name = name;
      user.save(done);
    });
  }
};

userSchema.statics.addSpace = function(email, space) {
  this.getUser(email, function (err, user) {
    if (err) throw err;
    user.local.spaces.push(space);
    user.save(done);
  });
};

userSchema.statics.removeSpace = function(email, space) {
  this.getUser(email, function (err, user) {
    if (err) throw err;
    user.local.spaces.pull(space);
    user.save(done);
  }); 
}

module.exports = mongoose.model('User', userSchema);