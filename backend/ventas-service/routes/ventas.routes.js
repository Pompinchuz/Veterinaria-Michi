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

router.get('/estadisticas/combinadas',
    AuthMiddleware.esPersonal,
    VentasController.obtenerEstadisticasCombinadas
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

// Rutas de gráficos
router.get('/graficos/por-dia',
    AuthMiddleware.esPersonal,
    VentasController.ventasPorDiaGrafico
);

router.get('/graficos/por-metodo',
    AuthMiddleware.esPersonal,
    VentasController.ventasPorMetodoGrafico
);

router.get('/graficos/por-categoria',
    AuthMiddleware.esPersonal,
    VentasController.ventasPorCategoriaGrafico
);

router.get('/graficos/por-hora',
    AuthMiddleware.esPersonal,
    VentasController.ventasPorHoraGrafico
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