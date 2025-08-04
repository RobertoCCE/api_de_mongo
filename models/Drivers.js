const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license: { type: String, unique: true },
  photo: String,
}, { collection: 'drivers' });

module.exports = mongoose.model('Driver', driverSchema);
