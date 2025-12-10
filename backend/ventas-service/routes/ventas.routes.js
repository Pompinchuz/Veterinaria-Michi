const express = require('express');
const router = express.Router();
const VentasController = require('../controllers/ventas.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas de estadísticas (deben ir antes de :id) - Solo admin y recepcionista
router.get('/estadisticas/generales',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.obtenerEstadisticas
);

router.get('/estadisticas/combinadas',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.obtenerEstadisticasCombinadas
);

router.get('/dia',
    AuthMiddleware.esPersonal,
    VentasController.ventasDelDia
);

router.get('/top-productos',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.topProductos
);

router.get('/top-productos-combinado',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.topProductosCombinado
);

router.get('/producto/:id/stats',
    AuthMiddleware.esPersonal,
    VentasController.estadisticasProducto
);

// Rutas de gráficos - Solo admin y recepcionista
router.get('/graficos/por-dia',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.ventasPorDiaGrafico
);

router.get('/graficos/por-metodo',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.ventasPorMetodoGrafico
);

router.get('/graficos/por-categoria',
    AuthMiddleware.esAdminORecepcionista,
    VentasController.ventasPorCategoriaGrafico
);

router.get('/graficos/por-hora',
    AuthMiddleware.esAdminORecepcionista,
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