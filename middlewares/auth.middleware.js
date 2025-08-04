const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader)
    return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Token inválido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Token inválido o expirado' });

    req.user = user;
    next();
  });
};
