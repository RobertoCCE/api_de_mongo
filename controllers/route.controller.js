const Route = require('../models/Ruta');
const Locality = require('../models/Localidad');

// Mapea la localidad simulando el formato exacto de Laravel
function mapLocation(loc) {
  if (!loc) return null;
  return {
    id: Number(loc.id), // <- aseguramos que sea numérico
    longitude: loc.longitude,
    latitude: loc.latitude,
    locality: loc.locality,
    street: loc.street,
    postal_code: loc.postal_code,
    municipality: loc.municipality,
    state: loc.state,
    country: loc.country,
    locality_type: loc.locality_type,
    created_at: loc.createdAt.toISOString(),
    updated_at: loc.updatedAt.toISOString(),
  };
}

// GET /routes
exports.index = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('location_s_id')
      .populate('location_f_id');

    const response = routes.map(route => ({
      id: route.id,
      location_s_id: Number(route.location_s_id.id),
      location_f_id: Number(route.location_f_id.id),
      created_at: route.createdAt.toISOString(),
      updated_at: route.updatedAt.toISOString(),
      location_start: mapLocation(route.location_s_id),
      location_end: mapLocation(route.location_f_id),
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las rutas', error: err.message });
  }
};

// POST /routes
exports.store = async (req, res) => {
  try {
    const { location_s_id, location_f_id } = req.body;

    if (!location_s_id || !location_f_id || location_s_id === location_f_id) {
      return res.status(400).json({ message: 'Localidades inválidas' });
    }

const locStart = await Locality.findById(location_s_id);
const locEnd = await Locality.findById(location_f_id);

    if (!locStart || !locEnd) {
      return res.status(404).json({ message: 'Una o ambas localidades no existen' });
    }

    const lastRoute = await Route.findOne().sort({ id: -1 });
    const nextId = lastRoute ? lastRoute.id + 1 : 1;

    const route = new Route({
      id: nextId,
      location_s_id: locStart._id,
      location_f_id: locEnd._id,
    });

    await route.save();
    await route.populate('location_s_id');
    await route.populate('location_f_id');

    res.status(201).json({
      message: 'Ruta creada correctamente',
      route: {
        id: route.id,
        location_s_id: Number(route.location_s_id.id),
        location_f_id: Number(route.location_f_id.id),
        created_at: route.createdAt.toISOString(),
        updated_at: route.updatedAt.toISOString(),
        location_start: mapLocation(route.location_s_id),
        location_end: mapLocation(route.location_f_id),
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la ruta', error: err.message });
  }
};

// GET /routes/:id
exports.show = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('location_s_id')
      .populate('location_f_id');

    if (!route) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }

    res.json({
      id: route.id,
      location_s_id: Number(route.location_s_id.id),
      location_f_id: Number(route.location_f_id.id),
      created_at: route.createdAt.toISOString(),
      updated_at: route.updatedAt.toISOString(),
      location_start: mapLocation(route.location_s_id),
      location_end: mapLocation(route.location_f_id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar la ruta', error: err.message });
  }
};

// PUT /routes/:id
exports.update = async (req, res) => {
  try {
    const { location_s_id, location_f_id } = req.body;

    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });

if (location_s_id) {
  const locStart = await Locality.findById(location_s_id);
  if (!locStart) return res.status(404).json({ message: 'Localidad de origen no encontrada' });
  route.location_s_id = locStart._id;
}

if (location_f_id) {
  const locEnd = await Locality.findById(location_f_id);
  if (!locEnd) return res.status(404).json({ message: 'Localidad de destino no encontrada' });
  // Revisa que sean diferentes si quieres
  if (location_s_id && location_s_id === location_f_id) {
    return res.status(400).json({ message: 'Las localidades deben ser diferentes' });
  }
  route.location_f_id = locEnd._id;
}


    await route.save();
    await route.populate('location_s_id');
    await route.populate('location_f_id');

    res.json({
      id: route.id,
      location_s_id: Number(route.location_s_id.id),
      location_f_id: Number(route.location_f_id.id),
      created_at: route.createdAt.toISOString(),
      updated_at: route.updatedAt.toISOString(),
      location_start: mapLocation(route.location_s_id),
      location_end: mapLocation(route.location_f_id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la ruta', error: err.message });
  }
};

// DELETE /routes/:id
exports.destroy = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json({ message: 'Ruta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la ruta', error: err.message });
  }
};