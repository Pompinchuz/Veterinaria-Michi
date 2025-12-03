const express = require('express');
const router = express.Router();
const CitasController = require('../controllers/citas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas especiales
router.get('/estadisticas/resumen', 
    AuthMiddleware.esPersonal,
    CitasController.obtenerEstadisticas
);

// Rutas principales - Personal puede ver y gestionar citas
router.get('/', 
    AuthMiddleware.esPersonal,
    CitasController.obtenerTodasCitas
);

router.get('/:id', 
    AuthMiddleware.esPersonal,
    CitasController.obtenerCitaPorId
);

router.post('/', 
    AuthMiddleware.esPersonal,
    CitasController.crearCita
);

router.put('/:id', 
    AuthMiddleware.esVeterinarioOAdmin,
    CitasController.actualizarCita
);

router.patch('/:id/estado', 
    AuthMiddleware.esPersonal,
    CitasController.cambiarEstadoCita
);

// Solo admin puede cancelar citas
router.delete('/:id', 
    AuthMiddleware.esAdmin,
    CitasController.cancelarCita
);

module.exports = router;