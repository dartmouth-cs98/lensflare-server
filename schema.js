var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },

  museums: { type: Array, 'default': [] }
});

var museumSchema = new mongoose.Schema({
  name: String,
  url: String,
  text: String
});

var User = mongoose.model('User', userSchema);
var Museum = mongoose.model('Museum', museumSchema);

module.exports = {
  User: User,
  Museum: Museum
};