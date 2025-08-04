const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.Controller');
const multer = require('multer');
const path = require('path');

// Configuración multer para guardar fotos en uploads/drivers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'drivers'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `foto_conductor-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Middleware para interceptar _method en req.body después de multer
function methodOverrideFromBody(req, res, next) {
  if (req.body && req.body._method) {
    req.method = req.body._method.toUpperCase();
  }
  next();
}

// Rutas
router.get('/', driverController.index);
router.post('/', upload.single('foto_conductor'), driverController.store);
router.get('/:id', driverController.show);

// Para actualizar, primero multer, luego methodOverrideFromBody, luego controlador
router.post('/:id', upload.single('foto_conductor'), methodOverrideFromBody, driverController.update);

router.delete('/:id', driverController.destroy);

module.exports = router;
