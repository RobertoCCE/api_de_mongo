const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');

// GET todas las ventas
router.get('/', ventaController.index);

module.exports = router;
