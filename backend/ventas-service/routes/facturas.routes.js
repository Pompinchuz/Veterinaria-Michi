const express = require('express');
const router = express.Router();
const FacturasController = require('../controllers/facturas.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas (requieren autenticación)
router.use(verificarToken);

// Generar facturas desde transacciones
router.post('/generar-desde-venta/:ventaId', FacturasController.generarDesdeVenta);
router.post('/generar-desde-orden/:ordenId', FacturasController.generarDesdeOrden);

// Consultar facturas
router.get('/', FacturasController.obtenerFacturas);
router.get('/mis-facturas', FacturasController.obtenerMisFacturas);
router.get('/dia', FacturasController.facturasDelDia);
router.get('/estadisticas/generales', FacturasController.obtenerEstadisticas);
router.get('/numero/:numeroFactura', FacturasController.obtenerFacturaPorNumero);
router.get('/cliente/:dni', FacturasController.obtenerFacturasPorCliente);
router.get('/:id', FacturasController.obtenerFacturaPorId);

// Anular factura (solo admin)
router.put('/:id/anular', FacturasController.anularFactura);

module.exports = router;
