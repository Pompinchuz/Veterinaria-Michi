const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuarios.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Todas estas rutas requieren autenticación
router.use(AuthMiddleware.verificarToken);

// Obtener todos los usuarios (solo admin)
router.get('/', 
    AuthMiddleware.esAdmin, 
    UsuariosController.obtenerTodosUsuarios
);

// Obtener usuario por ID (admin o el mismo usuario)
router.get('/:id', UsuariosController.obtenerUsuarioPorId);

// Actualizar usuario (admin o el mismo usuario)
router.put('/:id', UsuariosController.actualizarUsuario);

// Cambiar contraseña (admin o el mismo usuario)
router.put('/:id/password', UsuariosController.cambiarPassword);

// Eliminar usuario (solo admin)
router.delete('/:id', 
    AuthMiddleware.esAdmin, 
    UsuariosController.eliminarUsuario
);

module.exports = router;