var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var itemSchema = mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  url: { type: String, required: true, unique: true }
});
itemSchema.plugin(uniqueValidator);

itemSchema.methods.getItem = function (url, cb) {
  return this.model('Item').find({ url: new RegExp(url, 'i') }, cb);
};

itemSchema.methods.updateTitle = function(title) {
  // currently set to silently fail to update if empty string provided
  if (title.length > 0) {
    this.model('Item').getItem(function (err, item) {
      if (err) throw err;
      item.title = title;
      item.save(done);
    });
  }
};

itemSchema.methods.updateText = function(text) {
  // currently set to silently fail to update if empty string provided
  if (text.length > 0) {
    this.model('Item').getItem(function (err, item) {
      if (err) throw err;
      item.text = text;
      item.save(done);
    });
  }
};

module.exports = mongoose.model('Item', itemSchema);
