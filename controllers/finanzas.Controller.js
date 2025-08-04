const Sale = require('../models/Sale');
const mongoose = require('mongoose');

// Función para formatear fecha "YYYY-MM-DD HH:mm:ss"
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// 🔹 Filtro unificado (soporta createdAt y created_at)
function buildMatch(desde, hasta) {
  if (!desde && !hasta) return {};
  const rango = {};
  if (desde) rango.$gte = new Date(desde);
  if (hasta) rango.$lte = new Date(hasta);

  return {
    $or: [
      { createdAt: rango },
      { created_at: rango }
    ]
  };
}

// GET: /api/finanzas/resumen
exports.resumen = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const match = buildMatch(desde, hasta);

    console.log("📥 Filtro recibido en resumen:", match);

    const ingresosAgg = await Sale.aggregate([
      { $match: match },
      { $group: { _id: null, ingresos: { $sum: '$amount' } } }
    ]);

    const ingresos = ingresosAgg.length > 0 ? ingresosAgg[0].ingresos : 0;
    const egresos = 0; // por ahora no hay egresos

    res.json({
      ingresos,
      egresos,
      balance: ingresos - egresos,
      ventasPorDia: (await ventasAgrupadasPorDia(match)).map(v => ({
        fecha: v._id,
        total: v.total.toFixed(2)
      })),
      transacciones: await ventasDetalladas(match),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen', details: error.message });
  }
};

async function ventasAgrupadasPorDia(match) {
  return Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: { $ifNull: ['$createdAt', '$created_at'] }
          }
        },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
}

async function ventasDetalladas(match) {
  const ventas = await Sale.find(match)
    .select({ folio: 1, amount: 1, createdAt: 1, created_at: 1 })
    .sort({ createdAt: -1, created_at: -1 })
    .lean();

  return ventas.map(v => ({
    folio: isNaN(v.folio) ? v.folio : Number(v.folio),
    amount: Number(v.amount).toFixed(2),
    created_at: formatDate(v.createdAt || v.created_at),
  }));
}

// GET: /api/finanzas/ventas-detalle
exports.ventasDetalle = async (req, res) => {
  try {
    const { fecha } = req.query;

    let match = {};
    if (fecha) {
      const inicio = new Date(fecha + "T00:00:00");
      const fin = new Date(fecha + "T23:59:59");

      match = {
        $or: [
          { createdAt: { $gte: inicio, $lte: fin } },
          { created_at: { $gte: inicio, $lte: fin } }
        ]
      };
    }

    const ventas = await Sale.find(match)
      .select({ folio: 1, amount: 1, createdAt: 1, created_at: 1 })
      .sort({ createdAt: -1, created_at: -1 })
      .lean();

    const resultado = ventas.map(v => ({
      folio: isNaN(v.folio) ? v.folio : Number(v.folio),
      amount: Number(v.amount).toFixed(2),
      created_at: formatDate(v.createdAt || v.created_at),
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas detalle', details: error.message });
  }
};

// GET: /api/finanzas/ventas-periodo
exports.ventasPeriodo = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const match = buildMatch(desde, hasta);

    console.log("📥 Filtro recibido en ventasPeriodo:", match);

    const ventas = await ventasAgrupadasPorDia(match);
    res.json(ventas.map(v => ({
      fecha: v._id,
      total: v.total.toFixed(2)
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas por periodo', details: error.message });
  }
};

// GET: /api/finanzas/top-rutas
exports.topRutas = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const match = buildMatch(desde, hasta);

    console.log("📥 Filtro recibido en topRutas:", match);

    const ventas = await Sale.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'routeunitschedules',
          localField: 'id_route_unit_schedule',
          foreignField: '_id',
          as: 'schedule'
        }
      },
      { $unwind: '$schedule' },
      {
        $lookup: {
          from: 'routeunits',
          localField: 'schedule.id_route_unit',
          foreignField: '_id',
          as: 'route_unit'
        }
      },
      { $unwind: '$route_unit' },
      {
        $lookup: {
          from: 'routes',
          localField: 'route_unit.id_route',
          foreignField: '_id',
          as: 'route'
        }
      },
      { $unwind: '$route' },
      {
        $group: {
          _id: '$route.name',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    res.json(ventas.map(v => ({
      ruta: v._id,
      total: v.total
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener top rutas', details: error.message });
  }
};

// GET: /api/finanzas/balance-historico
exports.balanceHistorico = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const match = buildMatch(desde, hasta);

    console.log("📥 Filtro recibido en balanceHistorico:", match);

    const balance = await ventasAgrupadasPorDia(match);
    res.json(balance.map(v => ({
      fecha: v._id,
      ingresos: v.total
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener balance histórico', details: error.message });
  }
};
