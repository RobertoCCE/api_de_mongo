const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

// --- Función auxiliar para obtener rol ficticio ---
function obtenerRolesFicticios(user) {
  if (user.email === 'canulroberto37@gmail.com') {
    return [{ id: 1, name: 'admin' }];
  } else if (user.email === 'coordinador@rutvans.com') {
    return [{ id: 2, name: 'coordinador' }];
  } else {
    return [{ id: 3, name: 'chofer' }];
  }
}

// --- LOGIN ---
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

    if (password !== user.password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const roles = obtenerRolesFicticios(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        roles,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor', error });
  }
};

// --- GET USER ---
exports.getUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const roles = obtenerRolesFicticios(user);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      address: user.address,
      roles,
    });
  } catch (error) {
    console.error('getUser error:', error);
    res.status(500).json({ message: 'Error del servidor', error });
  }
};
