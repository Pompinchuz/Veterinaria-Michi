const express = require('express');
const router = express.Router();
const ProductosController = require('../controllers/productos.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas especiales (deben ir antes de las rutas con :id)
router.get('/categorias/lista', 
    AuthMiddleware.esPersonal,
    ProductosController.obtenerCategorias
);

router.get('/buscar/:termino', 
    AuthMiddleware.esPersonal,
    ProductosController.buscarProductos
);

router.get('/codigo/:codigoBarras', 
    AuthMiddleware.esPersonal,
    ProductosController.obtenerProductoPorCodigo
);

// Rutas principales - Personal puede ver productos
router.get('/', 
    AuthMiddleware.esPersonal,
    ProductosController.obtenerTodosProductos
);

router.get('/:id', 
    AuthMiddleware.esPersonal,
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