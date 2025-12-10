const express = require('express');
const router = express.Router();
const OrdenesController = require('../controllers/ordenes.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// ⭐ RUTAS PARA CLIENTES
// Cliente realiza una compra
router.post('/comprar', OrdenesController.realizarCompra);

// Cliente ve su historial de compras
router.get('/mis-compras', OrdenesController.misCompras);

// Cliente ve detalle de su orden
router.get('/:id', OrdenesController.obtenerOrden);

// Cliente cancela su orden (solo si está pendiente)
router.delete('/:id', OrdenesController.cancelarOrden);

// ⭐ RUTAS PARA PERSONAL
// Personal ve todas las órdenes
router.get('/',
    AuthMiddleware.esPersonal,
    OrdenesController.obtenerTodasOrdenes
);

// Personal actualiza estado de orden
router.patch('/:id/estado',
    AuthMiddleware.esPersonal,
    OrdenesController.actualizarEstado
);

// Estadísticas de órdenes
router.get('/estadisticas/generales',
    AuthMiddleware.esPersonal,
    OrdenesController.obtenerEstadisticas
);

module.exports = router;