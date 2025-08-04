const express = require('express');
const router = express.Router();
const localidadController = require('../controllers/Localidad.controller');

// Rutas REST
router.get('/', localidadController.getAll);
router.post('/', localidadController.create);
router.put('/:id', localidadController.update);
router.delete('/:id', localidadController.remove);

module.exports = router;
