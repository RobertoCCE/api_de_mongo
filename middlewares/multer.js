const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
    cb(null, unique);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!['.jpg', '.jpeg', '.png'].includes(ext.toLowerCase())) {
      return cb(new Error('Solo se permiten imágenes JPG o PNG'));
    }
    cb(null, true);
  }
});
