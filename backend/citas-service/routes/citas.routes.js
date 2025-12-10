const express = require('express');
const router = express.Router();
const CitasController = require('../controllers/citas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas especiales - Solo personal
router.get('/estadisticas/resumen',
    AuthMiddleware.esPersonal,
    CitasController.obtenerEstadisticas
);

// Rutas principales - Personal y clientes (con restricciones)
router.get('/',
    AuthMiddleware.verificarAccesoCliente,
    CitasController.obtenerTodasCitas
);

router.get('/:id',
    AuthMiddleware.verificarAccesoCliente,
    CitasController.obtenerCitaPorId
);

router.post('/',
    AuthMiddleware.esPersonalOCliente,
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

// Solo admin puede cancelar citas (DELETE completo)
router.delete('/:id',
    AuthMiddleware.esAdmin,
    CitasController.cancelarCita
);

module.exports = router;