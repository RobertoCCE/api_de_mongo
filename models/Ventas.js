const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  folio: { type: String, required: true },
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: false },
  id_route_unit_schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteUnitSchedule', required: false },
  id_rate: { type: mongoose.Schema.Types.ObjectId, ref: 'Rate', required: false },
  data: { type: Object, default: {} }, // equivalente a array/JSON en Laravel
  status: { type: String, default: 'pendiente' },
  amount: { type: Number, required: true }
}, { 
  timestamps: true, // añade createdAt y updatedAt automáticamente
  collection: 'sales'
});

module.exports = mongoose.model('Venta', ventaSchema);
