const FacturaModel = require('../models/factura.model');
const VentaModel = require('../models/venta.model');
const OrdenModel = require('../models/orden.model');

class FacturasController {

    // POST /api/facturas/generar-desde-venta/:ventaId
    static async generarDesdeVenta(req, res) {
        try {
            const { ventaId } = req.params;
            const { cliente_email, cliente_direccion } = req.body;

            // Obtener la venta
            const venta = await VentaModel.obtenerPorId(ventaId);

            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }

            if (!venta.activo) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede facturar una venta anulada'
                });
            }

            // Verificar si ya existe una factura para esta venta
            const facturaExistente = await FacturaModel.obtenerPorReferencia('venta', ventaId);
            if (facturaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta venta ya tiene una factura asociada',
                    factura: facturaExistente
                });
            }

            // Calcular subtotal e IGV (18% en Perú)
            const subtotal = parseFloat(venta.precio_total) / 1.18;
            const igv = parseFloat(venta.precio_total) - subtotal;

            // Preparar datos de la factura
            const facturaData = {
                tipo_transaccion: 'venta',
                referencia_id: venta.id,
                cliente_dni: venta.cliente_dni,
                cliente_nombre: venta.cliente_nombre || 'Cliente General',
                cliente_email: cliente_email || null,
                cliente_direccion: cliente_direccion || null,
                subtotal: subtotal.toFixed(2),
                igv: igv.toFixed(2),
                total: parseFloat(venta.precio_total).toFixed(2),
                metodo_pago: venta.metodo_pago,
                detalles: [{
                    producto_id: venta.producto_id,
                    descripcion: venta.producto_nombre + (venta.producto_categoria ? ` (${venta.producto_categoria})` : ''),
                    cantidad: venta.cantidad,
                    precio_unitario: parseFloat(venta.precio_unitario).toFixed(2),
                    subtotal: parseFloat(venta.precio_total).toFixed(2)
                }],
                observaciones: venta.observaciones
            };

            // Crear la factura
            const facturaId = await FacturaModel.crear(facturaData);
            const factura = await FacturaModel.obtenerPorId(facturaId);

            console.log('✅ Factura generada para venta:', ventaId, '- Factura:', factura.numero_factura_formateado);

            res.status(201).json({
                success: true,
                message: 'Factura electrónica generada exitosamente',
                data: factura
            });

        } catch (error) {
            console.error('❌ Error al generar factura desde venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar factura',
                error: error.message
            });
        }
    }

    // POST /api/facturas/generar-desde-orden/:ordenId
    static async generarDesdeOrden(req, res) {
        try {
            const { ordenId } = req.params;

            // Obtener la orden con sus productos
            const orden = await OrdenModel.obtenerPorId(ordenId);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
            }

            if (!orden.activo || orden.estado === 'cancelado') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede facturar una orden cancelada'
                });
            }

            // Verificar si ya existe una factura para esta orden
            const facturaExistente = await FacturaModel.obtenerPorReferencia('orden', ordenId);
            if (facturaExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta orden ya tiene una factura asociada',
                    factura: facturaExistente
                });
            }

            // Calcular subtotal e IGV (18% en Perú)
            const total = parseFloat(orden.total);
            const subtotal = total / 1.18;
            const igv = total - subtotal;

            // Preparar detalles de productos
            const detalles = orden.productos.map(producto => ({
                producto_id: producto.producto_id,
                descripcion: producto.producto_nombre + (producto.producto_categoria ? ` (${producto.producto_categoria})` : ''),
                cantidad: producto.cantidad,
                precio_unitario: parseFloat(producto.precio_unitario).toFixed(2),
                subtotal: parseFloat(producto.subtotal).toFixed(2)
            }));

            // Preparar datos de la factura
            const facturaData = {
                tipo_transaccion: 'orden',
                referencia_id: orden.id,
                cliente_dni: orden.cliente_dni,
                cliente_nombre: orden.cliente_nombre,
                cliente_email: orden.cliente_email,
                cliente_direccion: orden.direccion_entrega,
                subtotal: subtotal.toFixed(2),
                igv: igv.toFixed(2),
                total: total.toFixed(2),
                metodo_pago: orden.metodo_pago,
                detalles: detalles,
                observaciones: orden.observaciones
            };

            // Crear la factura
            const facturaId = await FacturaModel.crear(facturaData);
            const factura = await FacturaModel.obtenerPorId(facturaId);

            console.log('✅ Factura generada para orden:', ordenId, '- Factura:', factura.numero_factura_formateado);

            res.status(201).json({
                success: true,
                message: 'Factura electrónica generada exitosamente',
                data: factura
            });

        } catch (error) {
            console.error('❌ Error al generar factura desde orden:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar factura',
                error: error.message
            });
        }
    }

    // GET /api/facturas - Obtener todas las facturas
    static async obtenerFacturas(req, res) {
        try {
            const filtros = {
                cliente_dni: req.query.cliente_dni,
                estado: req.query.estado,
                tipo_transaccion: req.query.tipo_transaccion,
                fechaInicio: req.query.fechaInicio,
                fechaFin: req.query.fechaFin,
                limit: req.query.limit
            };

            const facturas = await FacturaModel.obtenerTodas(filtros);

            res.json({
                success: true,
                data: facturas,
                count: facturas.length
            });

        } catch (error) {
            console.error('Error al obtener facturas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener facturas',
                error: error.message
            });
        }
    }

    // GET /api/facturas/:id - Obtener factura por ID
    static async obtenerFacturaPorId(req, res) {
        try {
            const { id } = req.params;
            const factura = await FacturaModel.obtenerPorId(id);

            if (!factura) {
                return res.status(404).json({
                    success: false,
                    message: 'Factura no encontrada'
                });
            }

            res.json({
                success: true,
                data: factura
            });

        } catch (error) {
            console.error('Error al obtener factura:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener factura',
                error: error.message
            });
        }
    }

    // GET /api/facturas/numero/:numeroFactura - Obtener factura por número
    static async obtenerFacturaPorNumero(req, res) {
        try {
            const { numeroFactura } = req.params;
            const factura = await FacturaModel.obtenerPorNumero(numeroFactura);

            if (!factura) {
                return res.status(404).json({
                    success: false,
                    message: 'Factura no encontrada'
                });
            }

            res.json({
                success: true,
                data: factura
            });

        } catch (error) {
            console.error('Error al obtener factura:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener factura',
                error: error.message
            });
        }
    }

    // GET /api/facturas/cliente/:dni - Obtener facturas de un cliente
    static async obtenerFacturasPorCliente(req, res) {
        try {
            const { dni } = req.params;
            const facturas = await FacturaModel.obtenerPorCliente(dni);

            res.json({
                success: true,
                data: facturas,
                count: facturas.length
            });

        } catch (error) {
            console.error('Error al obtener facturas del cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener facturas del cliente',
                error: error.message
            });
        }
    }

    // GET /api/facturas/mis-facturas - Obtener facturas del usuario autenticado
    static async obtenerMisFacturas(req, res) {
        try {
            const clienteDni = req.usuario.dni;

            if (!clienteDni) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo identificar el DNI del cliente'
                });
            }

            const facturas = await FacturaModel.obtenerPorCliente(clienteDni);

            res.json({
                success: true,
                data: facturas,
                count: facturas.length
            });

        } catch (error) {
            console.error('Error al obtener mis facturas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener facturas',
                error: error.message
            });
        }
    }

    // PUT /api/facturas/:id/anular - Anular una factura
    static async anularFactura(req, res) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            const factura = await FacturaModel.obtenerPorId(id);

            if (!factura) {
                return res.status(404).json({
                    success: false,
                    message: 'Factura no encontrada'
                });
            }

            if (factura.estado === 'anulada') {
                return res.status(400).json({
                    success: false,
                    message: 'Esta factura ya está anulada'
                });
            }

            await FacturaModel.anular(id, motivo);

            console.log('✅ Factura anulada:', factura.numero_factura_formateado);

            res.json({
                success: true,
                message: 'Factura anulada exitosamente'
            });

        } catch (error) {
            console.error('Error al anular factura:', error);
            res.status(500).json({
                success: false,
                message: 'Error al anular factura',
                error: error.message
            });
        }
    }

    // GET /api/facturas/estadisticas/generales - Obtener estadísticas de facturas
    static async obtenerEstadisticas(req, res) {
        try {
            const { periodo } = req.query; // dia, semana, mes, año

            const estadisticas = await FacturaModel.obtenerEstadisticas(periodo || 'mes');

            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    // GET /api/facturas/dia - Facturas del día
    static async facturasDelDia(req, res) {
        try {
            const facturas = await FacturaModel.facturasDelDia();

            res.json({
                success: true,
                data: facturas,
                count: facturas.length
            });

        } catch (error) {
            console.error('Error al obtener facturas del día:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener facturas del día',
                error: error.message
            });
        }
    }
}

module.exports = FacturasController;
