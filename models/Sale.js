const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  folio: String,
  id_user: String,
  id_payment: String,
  id_route_unit_schedule: String,
  id_rate: String,
  data: { type: Object, default: {} },
  status: String,
  amount: Number,
  created_at: Date,
  updated_at: Date
}, {
  collection: 'sales'
});

module.exports = mongoose.model('Sale', saleSchema);
