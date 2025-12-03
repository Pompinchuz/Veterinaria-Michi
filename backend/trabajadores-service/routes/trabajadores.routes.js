const express = require('express');
const router = express.Router();
const TrabajadoresController = require('../controllers/trabajadores.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas principales - Solo admin puede gestionar trabajadores
router.get('/', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.obtenerTodosTrabajadores
);

router.get('/dni/:dni', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.obtenerTrabajadorPorDni
);

router.get('/:id', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.obtenerTrabajadorPorId
);

router.post('/', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.crearTrabajador
);

router.put('/:id', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.actualizarTrabajador
);

router.delete('/:id', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.eliminarTrabajador
);

// Rutas de horarios - Solo admin
router.get('/:id/horarios', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.obtenerHorariosTrabajador
);

router.post('/:id/horarios', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.agregarHorario
);

router.delete('/:id/horarios/:horarioId', 
    AuthMiddleware.esAdmin,
    TrabajadoresController.eliminarHorario
);

module.exports = router;