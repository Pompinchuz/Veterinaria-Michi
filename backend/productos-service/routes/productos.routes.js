const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas especiales (deben ir antes de las rutas con :id)
router.get('/categorias/lista', 
    ProductosController.obtenerCategorias
);

router.get('/buscar/:termino', 
    ProductosController.buscarProductos
);

router.get('/codigo/:codigoBarras', 
    ProductosController.obtenerProductoPorCodigo
);

// ⭐ Rutas de lectura - TODOS pueden ver productos (incluido cliente)
router.get('/', 
    ProductosController.obtenerTodosProductos
);

router.get('/:id', 
    ProductosController.obtenerProductoPorId
);

// Solo admin puede crear/editar/eliminar productos
router.post('/', 
    AuthMiddleware.esAdmin,
    ProductosController.crearProducto
);

router.put('/:id', 
    AuthMiddleware.esAdmin,
    ProductosController.actualizarProducto
);

router.patch('/:id/stock', 
    AuthMiddleware.esAdmin,
    ProductosController.actualizarStock
);

router.delete('/:id', 
    AuthMiddleware.esAdmin,
    ProductosController.eliminarProducto
);

module.exports = router;