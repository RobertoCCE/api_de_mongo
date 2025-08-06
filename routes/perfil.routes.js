const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');
const { verifyToken } = require('../middlewares/auth.middleware'); // tu middleware JWT
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/user'); // Ahora guarda en uploads/user
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  },
});


const upload = multer({ storage });

// Ruta para obtener perfil (GET)
router.get('/admin/perfil', verifyToken, perfilController.obtenerPerfil);

// Ruta para actualizar perfil (POST con multipart/form-data)
router.post(
  '/admin/actualizarPerfil',
  verifyToken,
  upload.single('profile_photo'), // 'profile_photo' es el nombre del campo en Multipart
  perfilController.actualizarPerfil
);

module.exports = router;
