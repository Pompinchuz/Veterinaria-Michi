const express = require('express');
const cors = require('cors');
require('dotenv').config();

const citasRoutes = require('./routes/citas.routes');

const app = express();
const PORT = process.env.PORT || 3005;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/citas', citasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '📅 API Veterinaria - Servicio de Citas',
        version: '1.0.0',
        database: 'MySQL',
        servicios_conectados: {
            clientes: process.env.CLIENTES_SERVICE_URL,
            mascotas: process.env.MASCOTAS_SERVICE_URL,
            trabajadores: process.env.TRABAJADORES_SERVICE_URL
        },
        endpoints: {
            getAll: 'GET /api/citas',
            getByEstado: 'GET /api/citas?estado=pendiente',
            getByFecha: 'GET /api/citas?fecha=2024-12-05',
            getByCliente: 'GET /api/citas?clienteDni=12345678',
            getByMascota: 'GET /api/citas?mascotaId=...',
            getByVeterinario: 'GET /api/citas?veterinarioId=1',
            getById: 'GET /api/citas/:id',
            getWithDetails: 'GET /api/citas/:id?incluirDetalles=true',
            getEstadisticas: 'GET /api/citas/estadisticas/resumen',
            create: 'POST /api/citas',
            update: 'PUT /api/citas/:id',
            changeEstado: 'PATCH /api/citas/:id/estado',
            cancel: 'DELETE /api/citas/:id'
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Citas corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});