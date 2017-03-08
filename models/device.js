var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var deviceSchema = mongoose.Schema({
    deviceName: {type: String, required: true},
    spaceName: {type: String, required: true},
    userEmail: {type: String, required: true}
});

deviceSchema.plugin(uniqueValidator);

// necessary to use email to find user initially on login
deviceSchema.statics.getDevice = function (deviceId, cb) {
    return this.findOne({'_id': deviceId}, cb);
};


deviceSchema.statics.deleteDevice = function (deviceId, cb) {
    return this.findOneAndRemove({'_id': deviceId}, cb);
};

deviceSchema.statics.setSpace = function (deviceId, spaceName, cb) {
    return this.findOne({'_id': deviceId}, (err, device) => {
        device.spaceName = spaceName;
        device.save((err) => {
            cb(err);
        });
    });
};

deviceSchema.statics.setName = function (deviceId, name, cb) {
    return this.findOne({'_id': deviceId}, (err, device) => {
        device.spaceName = name;

        device.save((err) => {
            console.log("HERE " + name)
            cb(err);
        });
    });
};

module.exports = mongoose.model('Device', deviceSchema);
