const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// Login sin encriptación
exports.login = async (req, res) => {
  console.log('BODY:', req.body);
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });

  try {
    const user = await User.findOne({ email });
    console.log('Usuario encontrado:', user);
    if (!user)
      return res.status(401).json({ message: 'Credenciales incorrectas' });

    // Comparar en texto plano
    if (password !== user.password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Crear token JWT (puedes incluir los datos que quieras dentro del payload)
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error });
  }
};

// Obtener datos del usuario autenticado
exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor', error });
  }
};
