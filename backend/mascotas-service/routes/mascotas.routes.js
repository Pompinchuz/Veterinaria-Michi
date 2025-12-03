const express = require('express');
const router = express.Router();
const MascotasController = require('../controllers/mascotas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas principales - Personal puede ver todo
router.get('/', 
    AuthMiddleware.esPersonal,
    MascotasController.obtenerTodasMascotas
);

router.get('/cliente/:dni', 
    AuthMiddleware.esPersonal,
    MascotasController.obtenerMascotasPorClienteDni
);

router.get('/:id', 
    AuthMiddleware.esPersonal,
    MascotasController.obtenerMascotaPorId
);

// Solo veterinarios y admin pueden crear/editar mascotas
router.post('/', 
    AuthMiddleware.esVeterinarioOAdmin,
    MascotasController.crearMascota
);

router.put('/:id', 
    AuthMiddleware.esVeterinarioOAdmin,
    MascotasController.actualizarMascota
);

// Solo admin puede eliminar mascotas
router.delete('/:id', 
    AuthMiddleware.esAdmin,
    MascotasController.eliminarMascota
);

// Rutas para vacunas e historial - Solo veterinarios y admin
router.post('/:id/vacunas', 
    AuthMiddleware.esVeterinarioOAdmin,
    MascotasController.agregarVacuna
);

router.post('/:id/historial', 
    AuthMiddleware.esVeterinarioOAdmin,
    MascotasController.agregarHistorial
);

module.exports = router;