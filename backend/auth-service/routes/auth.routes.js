const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (sin autenticación)
router.post('/register', AuthController.registrar);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refrescarToken);
router.post('/logout', AuthController.logout);

// Rutas protegidas (requieren autenticación)
router.get('/me', AuthMiddleware.verificarToken, AuthController.obtenerPerfil);

module.exports = router;