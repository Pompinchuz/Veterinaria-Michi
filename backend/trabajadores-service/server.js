const express = require('express');
const cors = require('cors');
require('dotenv').config();

const trabajadoresRoutes = require('./routes/trabajadores.routes');

const app = express();
const PORT = process.env.PORT || 3004;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/trabajadores', trabajadoresRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '👨‍⚕️ API Veterinaria - Servicio de Trabajadores',
        version: '1.0.0',
        database: 'MySQL',
        endpoints: {
            getAll: 'GET /api/trabajadores',
            getByCargo: 'GET /api/trabajadores?cargo=veterinario',
            getByDni: 'GET /api/trabajadores/dni/:dni',
            getById: 'GET /api/trabajadores/:id',
            getWithHorarios: 'GET /api/trabajadores/:id?incluirHorarios=true',
            create: 'POST /api/trabajadores',
            update: 'PUT /api/trabajadores/:id',
            delete: 'DELETE /api/trabajadores/:id',
            getHorarios: 'GET /api/trabajadores/:id/horarios',
            addHorario: 'POST /api/trabajadores/:id/horarios',
            deleteHorario: 'DELETE /api/trabajadores/:id/horarios/:horarioId'
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
    console.log(`🚀 Servidor de Trabajadores corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});