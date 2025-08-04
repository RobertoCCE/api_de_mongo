const User = require('../models/User'); // tu modelo de usuario
const fs = require('fs');
const path = require('path');

exports.obtenerPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Construir URL completa de la foto
    let fullPhotoUrl = '';
    if (user.profile_photo_path) {
      fullPhotoUrl = `${req.protocol}://${req.get('host')}${user.profile_photo_path}`;
    }

    res.json({
      name: user.name,
      email: user.email,
      address: user.address || '',
      phone_number: user.phone_number || '',
      profile_photo_url: fullPhotoUrl,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    });
  } catch (error) {
    console.error('Error obtenerPerfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.actualizarPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, phone_number } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (address !== undefined) user.address = address;
    if (phone_number !== undefined) user.phone_number = phone_number;

    if (req.file) {
      user.profile_photo_path = `/uploads/user/${req.file.filename}`;
    }

    await user.save();

    // Construir URL completa después de guardar
    let fullPhotoUrl = '';
    if (user.profile_photo_path) {
      fullPhotoUrl = `${req.protocol}://${req.get('host')}${user.profile_photo_path}`;
    }

    res.json({
      message: 'Perfil actualizado',
      user: {
        name: user.name,
        email: user.email,
        address: user.address || '',
        phone_number: user.phone_number || '',
        profile_photo_url: fullPhotoUrl,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error actualizarPerfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
