const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const routeSchema = new Schema({
  location_s_id: {
    type: Schema.Types.ObjectId,
    ref: 'Localidad',
    required: true
  },
  location_f_id: {
    type: Schema.Types.ObjectId,
    ref: 'Localidad',
    required: true
  },
  site_id: {
    type: Schema.Types.ObjectId,
    ref: 'Site',  // Asumiendo que tienes modelo Site en Mongoose
    required: false // O true si es obligatorio
  }
}, {
  timestamps: true,
  collection: 'route'
});

module.exports = mongoose.model('Route', routeSchema);
