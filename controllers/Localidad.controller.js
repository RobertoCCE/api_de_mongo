const Localidad = require('../models/Localidad');

exports.getAll = async (req, res) => {
  try {
    const localidades = await Localidad.find();
    // Mapear para agregar campo `id` como string basado en `_id`
    const response = localidades.map(loc => ({
      ...loc.toObject(),
      id: loc._id.toString(),  // <-- alias `id`
    }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener localidades', error: err });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevaLocalidad = new Localidad(req.body);
    const guardada = await nuevaLocalidad.save();
    const response = {
      ...guardada.toObject(),
      id: guardada._id.toString(),  // <-- alias `id`
    };
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear localidad', error: err });
  }
};

exports.update = async (req, res) => {
  try {
    const actualizada = await Localidad.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Localidad no encontrada' });
    }

    const response = {
      message: 'Localidad actualizada correctamente',
      data: {
        ...actualizada.toObject(),
        id: actualizada._id.toString(),  // <-- alias `id`
      }
    };

    res.json(response);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar localidad', error: err });
  }
};

exports.remove = async (req, res) => {
  try {
    const eliminada = await Localidad.findByIdAndDelete(req.params.id);

    if (!eliminada) {
      return res.status(404).json({ message: 'Localidad no encontrada' });
    }

    res.json({ message: 'Localidad eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar localidad', error: err });
  }
};
