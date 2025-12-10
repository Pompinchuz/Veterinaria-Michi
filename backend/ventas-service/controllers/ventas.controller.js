//ventas-service/controllers/ventas.controller.js

const VentaModel = require('../models/venta.model');
const OrdenModel = require('../models/orden.model');
const ExternosService = require('../services/externos.service');

class VentasController {

    // POST /api/ventas - Registrar nueva venta
    static async registrarVenta(req, res) {
        try {
            const {
                producto_id,
                cantidad,
                cliente_dni,
                metodo_pago,
                observaciones
            } = req.body;

            const token = req.headers.authorization?.split(' ')[1];

            // Validar campos obligatorios
            if (!producto_id || !cantidad) {
                return res.status(400).json({
                    success: false,
                    message: 'Producto y cantidad son obligatorios'
                });
            }

            if (cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            console.log('🛒 Iniciando venta del producto:', producto_id);

            // 1. Obtener información del producto
            const producto = await ExternosService.obtenerProducto(producto_id, token);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // 2. Verificar que hay stock suficiente
            if (producto.stock < cantidad) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente. Disponible: ${producto.stock} ${producto.unidadMedida}`,
                    stockDisponible: producto.stock
                });
            }

            // 3. Calcular totales
            const precio_unitario = producto.precio;
            const precio_total = precio_unitario * cantidad;

            // 4. Obtener información del cliente (opcional)
            let cliente_nombre = null;
            if (cliente_dni) {
                const cliente = await ExternosService.verificarCliente(cliente_dni, token);
                if (cliente) {
                    cliente_nombre = `${cliente.nombres} ${cliente.apellidos}`;
                }
            }

            // 5. Obtener información del vendedor
            const vendedor_id = req.usuario.id || null;
            const vendedor_nombre = req.usuario.nombre 
                ? `${req.usuario.nombre} ${req.usuario.apellido || ''}`.trim() 
                : null;

            // 6. Reducir el stock del producto
            await ExternosService.reducirStock(producto_id, cantidad, token);

            // 7. Registrar la venta
            const ventaData = {
                producto_id: producto._id || producto_id,
                producto_nombre: producto.nombre,
                producto_categoria: producto.categoria,
                cantidad,
                precio_unitario,
                precio_total,
                cliente_dni: cliente_dni || null,
                cliente_nombre,
                vendedor_id,
                vendedor_nombre,
                metodo_pago: metodo_pago || 'efectivo',
                observaciones: observaciones || null
            };

            const ventaId = await VentaModel.crear(ventaData);
            const ventaCreada = await VentaModel.obtenerPorId(ventaId);

            console.log('✅ Venta registrada exitosamente:', ventaId);

            res.status(201).json({
                success: true,
                message: 'Venta registrada exitosamente',
                data: ventaCreada
            });

        } catch (error) {
            console.error('❌ Error al registrar venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar venta',
                error: error.message
            });
        }
    }

    // GET /api/ventas - Obtener todas las ventas
    static async obtenerVentas(req, res) {
        try {
            const filtros = {
                fechaInicio: req.query.fechaInicio,
                fechaFin: req.query.fechaFin,
                producto_id: req.query.producto_id,
                cliente_dni: req.query.cliente_dni,
                metodo_pago: req.query.metodo_pago,
                limit: req.query.limit
            };

            const ventas = await VentaModel.obtenerTodas(filtros);

            res.json({
                success: true,
                data: ventas,
                count: ventas.length
            });

        } catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener ventas',
                error: error.message
            });
        }
    }

    // GET /api/ventas/:id - Obtener venta por ID
    static async obtenerVentaPorId(req, res) {
        try {
            const { id } = req.params;
            const venta = await VentaModel.obtenerPorId(id);

            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró venta con ID: ${id}`
                });
            }

            res.json({
                success: true,
                data: venta
            });

        } catch (error) {
            console.error('Error al buscar venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar venta',
                error: error.message
            });
        }
    }

    // GET /api/ventas/estadisticas/generales - Estadísticas generales
    static async obtenerEstadisticas(req, res) {
        try {
            const { periodo } = req.query; // dia, semana, mes, año

            const estadisticas = await VentaModel.obtenerEstadisticas(periodo || 'dia');
            const topProductos = await VentaModel.topProductos(5);
            const metodosPago = await VentaModel.ventasPorMetodoPago();

            res.json({
                success: true,
                data: {
                    resumen: estadisticas,
                    topProductos: topProductos,
                    metodosPago: metodosPago
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

    // GET /api/ventas/producto/:id/stats - Estadísticas de un producto
    static async estadisticasProducto(req, res) {
        try {
            const { id } = req.params;
            const stats = await VentaModel.ventasPorProducto(id);

            if (stats.veces_vendido === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron ventas para este producto'
                });
            }

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error al obtener estadísticas del producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas del producto',
                error: error.message
            });
        }
    }

    // GET /api/ventas/top-productos - Top productos más vendidos
    static async topProductos(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 10;
            const topProductos = await VentaModel.topProductos(limite);

            res.json({
                success: true,
                data: topProductos,
                count: topProductos.length
            });

        } catch (error) {
            console.error('Error al obtener top productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener top productos',
                error: error.message
            });
        }
    }

    // GET /api/ventas/dia - Ventas del día
    static async ventasDelDia(req, res) {
        try {
            const ventas = await VentaModel.ventasDelDia();

            const total = ventas.reduce((sum, venta) => sum + parseFloat(venta.precio_total), 0);

            res.json({
                success: true,
                data: ventas,
                count: ventas.length,
                total_ingresos: total
            });

        } catch (error) {
            console.error('Error al obtener ventas del día:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener ventas del día',
                error: error.message
            });
        }
    }

    // DELETE /api/ventas/:id - Anular venta (solo admin)
    static async anularVenta(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization?.split(' ')[1];

            // Obtener la venta antes de anularla
            const venta = await VentaModel.obtenerPorId(id);

            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró venta con ID: ${id}`
                });
            }

            if (!venta.activo) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta venta ya fue anulada'
                });
            }

            // Restaurar el stock del producto
            await ExternosService.aumentarStock(
                venta.producto_id,
                venta.cantidad,
                token
            );

            // Anular la venta
            await VentaModel.anular(id);

            console.log('✅ Venta anulada y stock restaurado:', id);

            res.json({
                success: true,
                message: 'Venta anulada exitosamente y stock restaurado'
            });

        } catch (error) {
            console.error('Error al anular venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al anular venta',
                error: error.message
            });
        }
    }

    // GET /api/ventas/top-productos-combinado - Top productos combinando ventas y órdenes
    static async topProductosCombinado(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 10;

            // Obtener top productos de ventas directas
            const topVentas = await VentaModel.topProductos(100);

            // Obtener top productos de órdenes (compras de clientes)
            const topOrdenes = await OrdenModel.topProductos(100);

            // Combinar ambos resultados
            const productosCombinados = {};

            // Agregar productos de ventas directas
            for (const producto of topVentas) {
                const id = producto.producto_id;
                productosCombinados[id] = {
                    producto_id: id,
                    producto_nombre: producto.producto_nombre,
                    producto_categoria: producto.producto_categoria,
                    total_vendido: parseFloat(producto.total_vendido) || 0,
                    veces_vendido: parseInt(producto.veces_vendido) || 0,
                    ingresos_generados: parseFloat(producto.ingresos_generados) || 0,
                    precio_promedio: parseFloat(producto.precio_promedio) || 0
                };
            }

            // Agregar productos de órdenes (compras de clientes)
            for (const producto of topOrdenes) {
                const id = producto.producto_id;

                if (productosCombinados[id]) {
                    // Si ya existe, sumar los valores
                    productosCombinados[id].total_vendido += parseFloat(producto.total_vendido) || 0;
                    productosCombinados[id].veces_vendido += parseInt(producto.veces_vendido) || 0;
                    productosCombinados[id].ingresos_generados += parseFloat(producto.ingresos_generados) || 0;

                    // Recalcular precio promedio
                    const totalVentas = productosCombinados[id].veces_vendido;
                    const precioVentasDirectas = parseFloat(topVentas.find(v => v.producto_id === id)?.precio_promedio) || 0;
                    const precioOrdenes = parseFloat(producto.precio_promedio) || 0;
                    const vecesVentasDirectas = parseInt(topVentas.find(v => v.producto_id === id)?.veces_vendido) || 0;
                    const vecesOrdenes = parseInt(producto.veces_vendido) || 0;

                    productosCombinados[id].precio_promedio =
                        ((precioVentasDirectas * vecesVentasDirectas) + (precioOrdenes * vecesOrdenes)) / totalVentas;
                } else {
                    // Si no existe, agregarlo
                    productosCombinados[id] = {
                        producto_id: id,
                        producto_nombre: producto.producto_nombre,
                        producto_categoria: producto.producto_categoria,
                        total_vendido: parseFloat(producto.total_vendido) || 0,
                        veces_vendido: parseInt(producto.veces_vendido) || 0,
                        ingresos_generados: parseFloat(producto.ingresos_generados) || 0,
                        precio_promedio: parseFloat(producto.precio_promedio) || 0
                    };
                }
            }

            // Convertir a array y ordenar por total vendido
            const productosArray = Object.values(productosCombinados)
                .sort((a, b) => b.total_vendido - a.total_vendido)
                .slice(0, limite);

            res.json({
                success: true,
                data: productosArray,
                count: productosArray.length,
                nota: 'Incluye ventas directas y compras de clientes'
            });

        } catch (error) {
            console.error('Error al obtener top productos combinado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener top productos',
                error: error.message
            });
        }
    }
}

module.exports = VentasController;