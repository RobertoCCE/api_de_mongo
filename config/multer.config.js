const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de tener esta carpeta
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
            return cb(new Error('Solo imágenes .jpg, .jpeg o .png'));
        }
        cb(null, true);
    }
});

module.exports = upload;
