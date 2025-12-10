const express = require('express');
const router = express.Router();
const ClientesController = require('../controllers/clientes.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas de clientes
// Solo personal puede ver todos los clientes
router.get('/',
    AuthMiddleware.esPersonal,
    ClientesController.getAllClientes
);

// Personal puede buscar cualquier cliente, clientes solo sus propios datos
router.get('/dni/:dni',
    AuthMiddleware.verificarAccesoDatosCliente,
    ClientesController.getClienteByDni
);

router.get('/:id',
    AuthMiddleware.esPersonal,
    ClientesController.getClienteById
);

// Solo personal puede crear clientes (el registro se hace por auth-service)
router.post('/',
    AuthMiddleware.esPersonal,
    ClientesController.createCliente
);

// Solo personal puede actualizar clientes (o se podría permitir que clientes actualicen sus datos)
router.put('/:id',
    AuthMiddleware.esPersonal,
    ClientesController.updateCliente
);

router.delete('/:id',
    AuthMiddleware.esAdmin,
    ClientesController.deleteCliente
);

module.exports = router;