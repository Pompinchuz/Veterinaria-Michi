const OrdenModel = require('../models/orden.model');
const FacturaModel = require('../models/factura.model');
const ExternosService = require('../services/externos.service');

class OrdenesController {

    // POST /api/ordenes/comprar - Cliente realiza una compra (carrito completo)
    static async realizarCompra(req, res) {
        try {
            const { productos, metodo_pago, direccion_entrega, observaciones } = req.body;
            const token = req.headers.authorization?.split(' ')[1];

            // Validar que haya productos
            if (!productos || productos.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debes agregar al menos un producto al carrito'
                });
            }

            console.log('🛒 Procesando compra de', productos.length, 'productos');

            // Obtener información del cliente desde el token
const cliente = await ExternosService.verificarClientePorEmail(req.usuario.email, token);
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró tu perfil de cliente'
                });
            }

            let totalOrden = 0;
            const productosValidados = [];

            // Validar cada producto y calcular total
            for (const item of productos) {
                const { producto_id, cantidad } = item;

                if (!producto_id || !cantidad || cantidad <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos de producto inválidos'
                    });
                }

                // Obtener información del producto
                const producto = await ExternosService.obtenerProducto(producto_id, token);

                if (!producto) {
                    return res.status(404).json({
                        success: false,
                        message: `Producto ${producto_id} no encontrado`
                    });
                }

                // Verificar stock
                if (producto.stock < cantidad) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
                        producto: producto.nombre
                    });
                }

                const subtotal = producto.precio * cantidad;
                totalOrden += subtotal;

                productosValidados.push({
                    producto_id: producto._id,
                    producto_nombre: producto.nombre,
                    producto_categoria: producto.categoria,
                    cantidad: cantidad,
                    precio_unitario: producto.precio,
                    subtotal: subtotal
                });
            }

            // Crear la orden
            const ordenData = {
                cliente_dni: cliente.dni,
                cliente_nombre: `${cliente.nombres} ${cliente.apellidos}`,
                cliente_email: cliente.email,
                total: totalOrden,
                metodo_pago: metodo_pago || 'efectivo',
                direccion_entrega: direccion_entrega || cliente.direccion,
                observaciones: observaciones || null
            };

            const ordenId = await OrdenModel.crear(ordenData, productosValidados);

            // Reducir stock de cada producto
            for (const item of productosValidados) {
                await ExternosService.reducirStock(item.producto_id, item.cantidad, token);
            }

            // Obtener la orden completa creada
            const ordenCreada = await OrdenModel.obtenerPorId(ordenId);

            console.log('✅ Compra realizada exitosamente. Orden:', ordenId);

            // Generar factura electrónica automáticamente
            let factura = null;
            try {
                const total = parseFloat(ordenCreada.total);
                const subtotal = total / 1.18;
                const igv = total - subtotal;

                const detalles = ordenCreada.productos.map(producto => ({
                    producto_id: producto.producto_id,
                    descripcion: producto.producto_nombre + (producto.producto_categoria ? ` (${producto.producto_categoria})` : ''),
                    cantidad: producto.cantidad,
                    precio_unitario: parseFloat(producto.precio_unitario).toFixed(2),
                    subtotal: parseFloat(producto.subtotal).toFixed(2)
                }));

                const facturaData = {
                    tipo_transaccion: 'orden',
                    referencia_id: ordenCreada.id,
                    cliente_dni: ordenCreada.cliente_dni,
                    cliente_nombre: ordenCreada.cliente_nombre,
                    cliente_email: ordenCreada.cliente_email,
                    cliente_direccion: ordenCreada.direccion_entrega,
                    subtotal: subtotal.toFixed(2),
                    igv: igv.toFixed(2),
                    total: total.toFixed(2),
                    metodo_pago: ordenCreada.metodo_pago,
                    detalles: detalles,
                    observaciones: ordenCreada.observaciones
                };

                const facturaId = await FacturaModel.crear(facturaData);
                factura = await FacturaModel.obtenerPorId(facturaId);
                console.log('📄 Factura generada automáticamente:', factura.numero_factura_formateado);
            } catch (facturaError) {
                console.error('⚠️ Error al generar factura automática:', facturaError.message);
                // No detener el proceso si falla la factura
            }

            res.status(201).json({
                success: true,
                message: '¡Compra realizada exitosamente!',
                data: ordenCreada,
                factura: factura
            });

        } catch (error) {
            console.error('❌ Error al realizar compra:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la compra',
                error: error.message
            });
        }
    }

    // GET /api/ordenes/mis-compras - Cliente ve su historial de compras
    static async misCompras(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            // Obtener información del cliente desde el token
const cliente = await ExternosService.verificarClientePorEmail(req.usuario.email, token);
            
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró tu perfil de cliente'
                });
            }

            const ordenes = await OrdenModel.obtenerPorCliente(cliente.dni);

            res.json({
                success: true,
                data: ordenes,
                count: ordenes.length
            });

        } catch (error) {
            console.error('Error al obtener mis compras:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tus compras',
                error: error.message
            });
        }
    }

    // GET /api/ordenes/:id - Obtener detalle de una orden
    static async obtenerOrden(req, res) {
        try {
            const { id } = req.params;
            const orden = await OrdenModel.obtenerPorId(id);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró orden con ID: ${id}`
                });
            }

            // Si es cliente, verificar que sea su orden
            if (req.usuario.rol === 'cliente') {
                const token = req.headers.authorization?.split(' ')[1];
const cliente = await ExternosService.verificarClientePorEmail(req.usuario.email, token);
                
                if (orden.cliente_dni !== cliente.dni) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para ver esta orden'
                    });
                }
            }

            res.json({
                success: true,
                data: orden
            });

        } catch (error) {
            console.error('Error al obtener orden:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener orden',
                error: error.message
            });
        }
    }

    // GET /api/ordenes - Personal ve todas las órdenes
    static async obtenerTodasOrdenes(req, res) {
        try {
            const filtros = {
                estado: req.query.estado,
                cliente_dni: req.query.cliente_dni,
                fechaInicio: req.query.fechaInicio,
                fechaFin: req.query.fechaFin,
                limit: req.query.limit
            };

            const ordenes = await OrdenModel.obtenerTodas(filtros);

            res.json({
                success: true,
                data: ordenes,
                count: ordenes.length
            });

        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener órdenes',
                error: error.message
            });
        }
    }

    // PATCH /api/ordenes/:id/estado - Actualizar estado de orden (solo personal)
    static async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const estadosValidos = ['pendiente', 'pagado', 'preparando', 'listo', 'completado', 'cancelado'];

            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido',
                    estadosValidos
                });
            }

            const orden = await OrdenModel.obtenerPorId(id);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró orden con ID: ${id}`
                });
            }

            await OrdenModel.actualizarEstado(id, estado);

            res.json({
                success: true,
                message: 'Estado actualizado exitosamente',
                nuevoEstado: estado
            });

        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar estado',
                error: error.message
            });
        }
    }

    // DELETE /api/ordenes/:id - Cancelar orden
    static async cancelarOrden(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization?.split(' ')[1];

            const orden = await OrdenModel.obtenerPorId(id);

            if (!orden) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró orden con ID: ${id}`
                });
            }

            // Si es cliente, verificar que sea su orden
            if (req.usuario.rol === 'cliente') {
const cliente = await ExternosService.verificarClientePorEmail(req.usuario.email, token);
                
                if (orden.cliente_dni !== cliente.dni) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permiso para cancelar esta orden'
                    });
                }

                // Cliente solo puede cancelar si está pendiente
                if (orden.estado !== 'pendiente') {
                    return res.status(400).json({
                        success: false,
                        message: 'Solo puedes cancelar órdenes pendientes'
                    });
                }
            }

            // Restaurar stock de cada producto
            for (const producto of orden.productos) {
                await ExternosService.aumentarStock(
                    producto.producto_id,
                    producto.cantidad,
                    token
                );
            }

            // Cancelar la orden
            await OrdenModel.cancelar(id);

            console.log('✅ Orden cancelada y stock restaurado:', id);

            res.json({
                success: true,
                message: 'Orden cancelada exitosamente y stock restaurado'
            });

        } catch (error) {
            console.error('Error al cancelar orden:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cancelar orden',
                error: error.message
            });
        }
    }

    // GET /api/ordenes/estadisticas/generales - Estadísticas de órdenes
    static async obtenerEstadisticas(req, res) {
        try {
            const { periodo } = req.query;

            const estadisticas = await OrdenModel.obtenerEstadisticas(periodo || 'dia');
            const topProductos = await OrdenModel.topProductos(5);

            res.json({
                success: true,
                data: {
                    resumen: estadisticas,
                    topProductos: topProductos
                }
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
}

module.exports = OrdenesController;