const Driver = require('../models/Drivers');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Ruta para guardar fotos (ajústala)
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'drivers');

// Asegura que exista la carpeta
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Función para obtener URL completa de la foto
function getFotoUrl(req, filename) {
  if (!filename) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/drivers/${filename}`;
}

// GET: /api/drivers
exports.index = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('user_id').lean();

    const formatted = drivers.map(driver => {
      const foto = driver.photo
        ? getFotoUrl(req, driver.photo)
        : driver.user_id?.profile_photo_path || null;

      return {
        driver_id: driver.id || driver._id.toString(),
        user_id: driver.user_id?.id || driver.user_id?._id.toString(),
        nombre: driver.user_id?.name,
        telefono: driver.user_id?.phone_number || null,
        email_usuario: driver.user_id?.email,
        licencia: driver.license,
        foto,
      };
    });

    res.json({ total: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener conductores', details: error.message });
  }
};

// POST: /api/drivers  (recibe foto con multer)
exports.store = async (req, res) => {
  try {
    const { nombre, licencia, telefono, email, password } = req.body;

    if (!nombre || !email || !password || !licencia) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: nombre,
      email,
      password: hashedPassword,
      phone_number: telefono || null,
    });

    let filename = null;
    if (req.file) {
      filename = req.file.filename;
    }

    const newDriver = await Driver.create({
      user_id: newUser._id,
      license: licencia,
      photo: filename,
    });

    res.status(201).json({
      message: 'Conductor creado exitosamente',
      driver: {
        ...newDriver.toObject(),
        photo: getFotoUrl(req, filename),
      },
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear conductor', details: error.message });
  }
};

// PUT: /api/drivers/:id  (actualizar con foto opcional)
exports.update = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user_id');
    if (!driver) return res.status(404).json({ error: 'Conductor no encontrado' });

    const { nombre, licencia, telefono, email } = req.body;

    if (licencia) {
      const licenseExists = await Driver.findOne({ license: licencia, _id: { $ne: driver._id } });
      if (licenseExists) return res.status(400).json({ error: 'Licencia ya en uso' });
      driver.license = licencia;
    }

    if (req.file) {
      if (driver.photo) {
        const oldPath = path.join(UPLOADS_DIR, driver.photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      driver.photo = req.file.filename;
    }

    if (driver.user_id) {
      if (nombre) driver.user_id.name = nombre;
      if (telefono) driver.user_id.phone_number = telefono;
      if (email) {
        const emailExists = await User.findOne({ email, _id: { $ne: driver.user_id._id } });
        if (emailExists) return res.status(400).json({ error: 'Email ya en uso' });
        driver.user_id.email = email;
      }
      await driver.user_id.save();
    }

    await driver.save();

    res.json({
      message: 'Conductor actualizado exitosamente',
      driver: {
        driver_id: driver._id,
        user_id: driver.user_id?._id,
        nombre: driver.user_id?.name,
        telefono: driver.user_id?.phone_number || null,
        email_usuario: driver.user_id?.email,
        licencia: driver.license,
        foto: getFotoUrl(req, driver.photo),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar conductor', details: error.message });
  }
};

// GET: /api/drivers/:id (igual que antes, con url para foto)
exports.show = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user_id').lean();
    if (!driver) return res.status(404).json({ error: 'Conductor no encontrado' });

    const foto = driver.photo ? getFotoUrl(req, driver.photo) : driver.user_id?.profile_photo_path || null;

    res.json({
      driver_id: driver._id,
      user_id: driver.user_id?._id,
      nombre: driver.user_id?.name,
      telefono: driver.user_id?.phone_number || null,
      email_usuario: driver.user_id?.email,
      licencia: driver.license,
      foto,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al mostrar conductor', details: error.message });
  }
};

// DELETE: /api/drivers/:id
exports.destroy = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ error: 'Conductor no encontrado' });

    if (driver.photo) {
      const oldPath = path.join(UPLOADS_DIR, driver.photo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // await User.findByIdAndDelete(driver.user_id); // Si quieres eliminar user también

    await driver.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar conductor', details: error.message });
  }
};
