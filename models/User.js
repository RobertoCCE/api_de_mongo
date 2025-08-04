const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  phone_number: { type: String, maxlength: 20 },
  address: { type: String, maxlength: 255 },
  date_of_birth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  password: { type: String, required: true }, // Asegúrate de hashearlo antes de guardar

  // Jetstream / Fortify extras
  email_verified_at: { type: Date, default: null },
  current_team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  two_factor_secret: { type: String, default: null },
  two_factor_recovery_codes: { type: [String], default: [] },
  remember_token: { type: String, default: null },
  profile_photo_path: { type: String, default: null },

}, {
  timestamps: true,
  collection: 'user'
});

module.exports = mongoose.model('User', userSchema);
