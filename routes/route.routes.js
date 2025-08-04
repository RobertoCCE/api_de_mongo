const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');

router.get('/', routeController.index);
router.post('/', routeController.store);
router.get('/:id', routeController.show);
router.put('/:id', routeController.update);
router.delete('/:id', routeController.destroy);

module.exports = router;
