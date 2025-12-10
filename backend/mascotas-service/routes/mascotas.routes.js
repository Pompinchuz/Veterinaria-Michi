const express = require('express');
const router = express.Router();
const MascotasController = require('../controllers/mascotas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas principales
// Solo personal puede ver todas las mascotas
router.get('/',
    AuthMiddleware.esPersonal,
    MascotasController.obtenerTodasMascotas
);

// Personal puede ver mascotas de cualquier cliente, clientes sus propias mascotas
router.get('/cliente/:dni',
    AuthMiddleware.esPersonalOCliente,
    MascotasController.obtenerMascotasPorClienteDni
);

// Personal y clientes pueden ver detalles de mascotas (se validará en controlador)
router.get('/:id',
    AuthMiddleware.esPersonalOCliente,
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