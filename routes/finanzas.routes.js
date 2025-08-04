const express = require('express');
const router = express.Router();
const finanzasController = require('../controllers/finanzas.Controller');

router.get('/resumen', finanzasController.resumen);
router.get('/ventas-detalle', finanzasController.ventasDetalle);
router.get('/ventas-periodo', finanzasController.ventasPeriodo);
router.get('/top-rutas', finanzasController.topRutas);
router.get('/balance-historico', finanzasController.balanceHistorico);

module.exports = router;
