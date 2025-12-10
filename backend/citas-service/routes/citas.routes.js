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

// ⭐ Rutas principales - Cliente puede ver con filtro, Personal puede ver todo
router.get('/', 
    CitasController.obtenerTodasCitas
);

router.get('/:id', 
    CitasController.obtenerCitaPorId
);

// Solo personal puede crear/modificar citas
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