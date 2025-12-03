const express = require('express');
const cors = require('cors');
require('dotenv').config();

const conectarDB = require('./config/database');
const productosRoutes = require('./routes/productos.routes');

const app = express();
const PORT = process.env.PORT || 3003;

// Conectar a MongoDB
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/productos', productosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🛒 API Veterinaria - Servicio de Productos',
        version: '1.0.0',
        database: 'MongoDB',
        endpoints: {
            getAll: 'GET /api/productos',
            getAllByCategoria: 'GET /api/productos?categoria=alimento',
            getStockBajo: 'GET /api/productos?stockBajo=true',
            getById: 'GET /api/productos/:id',
            getByCodigo: 'GET /api/productos/codigo/:codigoBarras',
            search: 'GET /api/productos/buscar/:termino',
            getCategorias: 'GET /api/productos/categorias/lista',
            create: 'POST /api/productos',
            update: 'PUT /api/productos/:id',
            updateStock: 'PATCH /api/productos/:id/stock',
            delete: 'DELETE /api/productos/:id'
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
    console.log(`🚀 Servidor de Productos corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});