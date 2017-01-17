var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var spaceSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  items: { type: Array, 'default': [] }
});
spaceSchema.plugin(uniqueValidator);

spaceSchema.statics.getSpace = function (name, cb) {
  return this.find({ name: new RegExp(name, 'i') }, cb);
};

spaceSchema.statics.getItems = function (name, cb) {
  return this.find({ name: new RegExp(name, 'i') }, 'items -_id', cb);
};

spaceSchema.statics.updateName = function(oldName, newName) {
  // currently set to silently fail to update if empty string provided
  if (name.length > 0) {
    this.getSpace(oldName, function (err, space) {
      if (err) throw err;
      space.name = newName;

      // uniqueValidator should have this line throw an error if name is not unique
      space.save(function (err) { 
        console.log(err); // PLACEHOLDER
      });
    });
  }
};

spaceSchema.statics.addItem = function(name, item) {
  this.getSpace(name, function (err, space) {
    if (err) throw err;
    space.items.push(item);
    space.save(done);
  });
};

spaceSchema.methods.removeItem = function(name, item) {
  this.getSpace(name, function (err, space) {
    if (err) throw err;
    space.items.pull(item);
    space.save(done);
  }); 
}

module.exports = mongoose.model('Space', spaceSchema);