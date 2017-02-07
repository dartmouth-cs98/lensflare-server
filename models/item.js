var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var itemSchema = mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  url: { type: String, required: true}
});
itemSchema.plugin(uniqueValidator);

itemSchema.statics.getItem = function (url, cb) {
  return this.find({ url: new RegExp(url, 'i') }, cb);
};

itemSchema.statics.updateTitle = function(url, title) {
  // currently set to silently fail to update if empty string provided
  if (title.length > 0) {
    this.getItem(url, function (err, item) {
      if (err) throw err;
      item.title = title;
      item.save(done);
    });
  }
};

itemSchema.statics.updateText = function(url, text) {
  // currently set to silently fail to update if empty string provided
  if (text.length > 0) {
    this.getItem(url, function (err, item) {
      if (err) throw err;
      item.text = text;
      item.save(done);
    });
  }
};

module.exports = mongoose.model('Item', itemSchema);
