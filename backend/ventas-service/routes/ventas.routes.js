const express = require('express');
const router = express.Router();
const VentasController = require('../controllers/ventas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas de estadísticas (deben ir antes de :id)
router.get('/estadisticas/generales', 
    AuthMiddleware.esPersonal,
    VentasController.obtenerEstadisticas
);

router.get('/dia',
    AuthMiddleware.esPersonal,
    VentasController.ventasDelDia
);

router.get('/top-productos',
    AuthMiddleware.esPersonal,
    VentasController.topProductos
);

router.get('/top-productos-combinado',
    AuthMiddleware.esPersonal,
    VentasController.topProductosCombinado
);

router.get('/producto/:id/stats',
    AuthMiddleware.esPersonal,
    VentasController.estadisticasProducto
);

// Rutas principales
router.get('/',
    AuthMiddleware.esPersonal,
    VentasController.obtenerVentas
);

router.get('/:id',
    AuthMiddleware.esPersonal,
    VentasController.obtenerVentaPorId
);

router.post('/',
    AuthMiddleware.esPersonal,
    VentasController.registrarVenta
);

// Solo admin puede anular ventas
router.delete('/:id',
    AuthMiddleware.esAdmin,
    VentasController.anularVenta
);

module.exports = router;