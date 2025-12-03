require('dotenv').config();
const express = require('express');
const cors = require('cors');


const connectDB = require('./config/database');
const mascotasRoutes = require('./routes/mascotas.routes');

const app = express();
const PORT = process.env.PORT || 3002;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/mascotas', mascotasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🐾 API Veterinaria - Servicio de Mascotas',
        version: '1.0.0',
        database: 'MongoDB',
        endpoints: {
            getAll: 'GET /api/mascotas',
            getById: 'GET /api/mascotas/:id',
            getByClienteDni: 'GET /api/mascotas/cliente/:dni',
            create: 'POST /api/mascotas',
            update: 'PUT /api/mascotas/:id',
            delete: 'DELETE /api/mascotas/:id',
            addVacuna: 'POST /api/mascotas/:id/vacunas',
            addHistorial: 'POST /api/mascotas/:id/historial'
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
    console.log(`🚀 Servidor de Mascotas corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});