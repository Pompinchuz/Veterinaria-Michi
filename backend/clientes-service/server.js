const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/clientes', clientesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🏥 API Veterinaria - Servicio de Clientes',
        version: '1.0.0',
        endpoints: {
            getAll: 'GET /api/clientes',
            getByDni: 'GET /api/clientes/dni/:dni',
            getById: 'GET /api/clientes/:id',
            create: 'POST /api/clientes',
            update: 'PUT /api/clientes/:id',
            delete: 'DELETE /api/clientes/:id'
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
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});