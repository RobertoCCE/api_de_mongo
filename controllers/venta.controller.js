const Venta = require('../models/Ventas');

// GET: /api/ventas
exports.index = async (req, res) => {
  try {
    const ventas = await Venta.find();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas', details: error.message });
  }
};
