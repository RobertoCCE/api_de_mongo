const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');  // Para manejar rutas de archivos
require('dotenv').config();

const localidadRoutes = require('./routes/localidad.routes');
const authRoutes = require('./routes/auth.routes');       // Rutas de autenticación
const { verifyToken } = require('./middlewares/auth.middleware');  // Middleware JWT
const routeRoutes = require('./routes/route.routes');
const driverRoutes = require('./routes/driver.routes'); // Rutas de conductores
const ventaRoutes = require('./routes/venta.routes');
const finanzasRoutes = require('./routes/finanzas.routes');
const perfilRoutes = require('./routes/perfil.routes');  // Importa las rutas de perfil

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares generales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (ejemplo: fotos guardadas en /uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Servir foto por defecto (asegúrate de tener esta ruta y archivo)
app.use('/default-profile-photo.png', express.static(path.join(__dirname, 'public/default-profile-photo.png')));

// Middleware para log de métodos y URLs
app.use((req, res, next) => {
  console.log(`Método: ${req.method}, URL: ${req.url}`);
  next();
});

// --- Rutas públicas ---
app.use('/api/auth', authRoutes);

// --- Rutas protegidas ---
// Aplica el middleware verifyToken para proteger rutas que requieren autenticación
app.use('/api/localities', verifyToken, localidadRoutes);
app.use('/api/routes', verifyToken, routeRoutes);
app.use('/api/ventas', verifyToken, ventaRoutes);
app.use('/api/finanzas', verifyToken, finanzasRoutes);
app.use('/api/drivers', verifyToken, driverRoutes);
app.use('/api', verifyToken, perfilRoutes);  // Aquí monta las rutas de perfil

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conectado a MongoDB Atlas');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
  });
})
.catch(err => console.error('Error de conexión:', err));
