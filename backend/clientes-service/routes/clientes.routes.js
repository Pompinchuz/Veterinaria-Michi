const express = require('express');
const router = express.Router();
const ClientesController = require('../controllers/clientes.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// Rutas de clientes - requieren ser personal (admin, veterinario, enfermera, recepcionista)
router.get('/', 
    AuthMiddleware.esPersonal,
    ClientesController.getAllClientes
);

router.get('/dni/:dni', 
    AuthMiddleware.esPersonal,
    ClientesController.getClienteByDni
);

router.get('/:id', 
    AuthMiddleware.esPersonal,
    ClientesController.getClienteById
);

router.post('/', 
    AuthMiddleware.esPersonal,
    ClientesController.createCliente
);

router.put('/:id', 
    AuthMiddleware.esPersonal,
    ClientesController.updateCliente
);

router.delete('/:id', 
    AuthMiddleware.esAdmin,
    ClientesController.deleteCliente
);

module.exports = router;