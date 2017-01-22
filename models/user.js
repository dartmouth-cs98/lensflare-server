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

userSchema.statics.getUser = function (email, cb) {
  return this.find({ 'local.email': new RegExp(str, 'i') }, cb);
};

userSchema.statics.getSpaces = function (email, cb) {
  return this.find({ 'local.email': new RegExp(email, 'i') }, 'spaces -_id', cb);
};

userSchema.statics.removeUser = function (email, cb) {
  return this.findOneAndRemove({ 'local.email': new RegExp(email, 'i') }, cb);
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

userSchema.statics.updateSpaces = function(localUser) {
  // currently set to silently fail to update if empty string provided
  // user.save(done);

  // this.getUser(user.local.email, function (err, user) {
  //   if (err) throw err;
  //     user.local.museums = user.spaces;
  //     user.save(done);
  // });

  console.log(localUser);
  // //
  this.findOne({ 'local.email': localUser.local.email}, function (err, user) {
    if (err) throw err;
    // console.log(email);
    console.log(user);
    console.log(localUser);
    user.local.name = "rich";
    // user.local.name
    user.local.spaces = [{name: "The MoMA",
                          items: [
                            {title:"T-Rex", text:"The T-Rex is a scary beast, it will eat you up and gobble you whole, without a second thought for your wellbeing or happiness.", url: "http://islanublar.jurassicworld.com/media/dinosaurs/tyrannosaurus-rex/tyrannosaurus-rex-info-graphic.png"},
                            {title:"Diplo", text:"The long neck giraffe beast is also pretty fucking scary but it's less terrifying that a T-Rex because it prob can't eat you whole or it would choke. It prob also only eats grass.", url: "http://f.tqn.com/y/dinosaurs/1/S/N/Q/-/-/diplodocus-carnegi.jpg"},
                            {title:"Sphinx", text:"The Sphinx will ask you a very difficult riddle; if you are able to figure out the answer to the riddle then you can move on past her forboding glare and into the pyramid.", url: "http://www.guardians.net/egypt/sphinx/images/sphinx-front-wa-2001.jpg"},
                          ]
                        }];
    console.log(req.param('input-box'));
    user.save(function(err) {
      if (err) throw err;
      console.log("saved");
    });
  });
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
