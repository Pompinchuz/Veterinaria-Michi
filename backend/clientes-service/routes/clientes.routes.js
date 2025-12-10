const express = require('express');
const router = express.Router();
const ClientesController = require('../controllers/clientes.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(AuthMiddleware.verificarToken);

// ⭐ NUEVO: Ruta para que el cliente obtenga su propio perfil
router.get('/mi-perfil', ClientesController.getMiPerfil);

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

// ⭐ Permite que cliente cree su propio perfil O que el personal cree clientes
router.post('/', 
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