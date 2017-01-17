var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var spaceSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  items: { type: Array, 'default': [] }
});
spaceSchema.plugin(uniqueValidator);

spaceSchema.methods.getSpace = function (cb) {
  return this.model('Space').find({ name: this.name }, cb);
};

spaceSchema.methods.getItems = function (cb) {
  return this.model('Space').find({ name: this.name }, 'items -_id', cb);
};

spaceSchema.methods.updateName = function(name) {
  // currently set to silently fail to update if empty string provided
  if (name.length > 0) {
    this.model('Space').getSpace(function (err, space) {
      if (err) throw err;
      space.name = name;

      // uniqueValidator should have this line throw an error if name is not unique
      space.save(function (err) { 
        console.log(err); // PLACEHOLDER
      });
    });
  }
};

userSchema.methods.addItem = function(item) {
  this.model('Space').getSpace(function (err, space) {
    if (err) throw err;
    space.items.push(item);
    space.save(done);
  });
};

userSchema.methods.removeItem = function(item) {
  this.model('Space').getSpace(function (err, space) {
    if (err) throw err;
    space.items.pull(item);
    space.save(done);
  }); 
}

module.exports = mongoose.model('Space', spaceSchema);