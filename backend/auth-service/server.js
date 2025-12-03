const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();
const PORT = process.env.PORT || 3006;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🔐 API Veterinaria - Servicio de Autenticación',
        version: '1.0.0',
        database: 'MySQL',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/auth/me (requiere token)'
            },
            usuarios: {
                getAll: 'GET /api/usuarios (admin)',
                getById: 'GET /api/usuarios/:id',
                update: 'PUT /api/usuarios/:id',
                changePassword: 'PUT /api/usuarios/:id/password',
                delete: 'DELETE /api/usuarios/:id (admin)'
            }
        },
        roles: ['admin', 'veterinario', 'enfermera', 'recepcionista', 'cliente'],
        usuariosPrueba: {
            admin: { email: 'admin@vetclinic.com', password: 'admin123' },
            veterinario: { email: 'carlos.mendoza@vetclinic.com', password: 'vet123' },
            enfermera: { email: 'maria.quispe@vetclinic.com', password: 'enf123' },
            cliente: { email: 'juan.perez@email.com', password: 'cliente123' }
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
    console.log(`🚀 Servidor de Autenticación corriendo en http://localhost:${PORT}`);
    console.log(`📋 Documentación: http://localhost:${PORT}/`);
});