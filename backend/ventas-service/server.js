const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
const ventasRoutes = require('./routes/ventas.routes');
const ordenesRoutes = require('./routes/ordenes.routes'); // ⭐ NUEVO

app.use('/api/ventas', ventasRoutes);
app.use('/api/ordenes', ordenesRoutes); // ⭐ NUEVO

// Ruta de salud
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ventas Service API',
        version: '1.0.0',
        endpoints: {
            ventas: '/api/ventas',
            ordenes: '/api/ordenes', // ⭐ NUEVO
            estadisticas: '/api/ventas/estadisticas/generales',
            topProductos: '/api/ventas/top-productos',
            ventasDelDia: '/api/ventas/dia',
            misCompras: '/api/ordenes/mis-compras' // ⭐ NUEVO
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

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Ventas corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});

