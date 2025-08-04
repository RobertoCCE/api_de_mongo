const mongoose = require('mongoose');

const localidadSchema = new mongoose.Schema({
  longitude:      { type: Number, required: true },
  latitude:       { type: Number, required: true },
  locality:       { type: String, required: true },
  street:         { type: String },
  postal_code:    { type: String },
  municipality:   { type: String },
  state:          { type: String },
  country:        { type: String, required: true },
  locality_type:  { type: String }
}, { timestamps: true, collection: 'localities' }); // <-- aseguras que use 'localities'

module.exports = mongoose.model('Localidad', localidadSchema);
