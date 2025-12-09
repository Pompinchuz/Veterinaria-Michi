const db = require('../config/database');

class OrdenModel {

    // Crear nueva orden con sus productos
    static async crear(ordenData, productos) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Crear la orden
            const [resultadoOrden] = await connection.query(
                `INSERT INTO ordenes (
                    cliente_dni, cliente_nombre, cliente_email, total, 
                    metodo_pago, direccion_entrega, observaciones, estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ordenData.cliente_dni,
                    ordenData.cliente_nombre,
                    ordenData.cliente_email,
                    ordenData.total,
                    ordenData.metodo_pago || 'efectivo',
                    ordenData.direccion_entrega || null,
                    ordenData.observaciones || null,
                    'pendiente'
                ]
            );

            const ordenId = resultadoOrden.insertId;

            // 2. Crear los detalles de la orden (productos)
            for (const producto of productos) {
                await connection.query(
                    `INSERT INTO ordenes_detalle (
                        orden_id, producto_id, producto_nombre, producto_categoria,
                        cantidad, precio_unitario, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        ordenId,
                        producto.producto_id,
                        producto.producto_nombre,
                        producto.producto_categoria || null,
                        producto.cantidad,
                        producto.precio_unitario,
                        producto.subtotal
                    ]
                );
            }

            await connection.commit();
            return ordenId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener orden por ID con sus productos
    static async obtenerPorId(id) {
        const [ordenes] = await db.query(
            'SELECT * FROM ordenes WHERE id = ?',
            [id]
        );

        if (ordenes.length === 0) return null;

        const orden = ordenes[0];

        // Obtener productos de la orden
        const [productos] = await db.query(
            'SELECT * FROM ordenes_detalle WHERE orden_id = ?',
            [id]
        );

        orden.productos = productos;
        return orden;
    }

    // Obtener todas las órdenes con filtros
    static async obtenerTodas(filtros = {}) {
        let query = 'SELECT * FROM ordenes WHERE activo = TRUE';
        const params = [];

        if (filtros.cliente_dni) {
            query += ' AND cliente_dni = ?';
            params.push(filtros.cliente_dni);
        }

        if (filtros.estado) {
            query += ' AND estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.fechaInicio && filtros.fechaFin) {
            query += ' AND DATE(fecha_orden) BETWEEN ? AND ?';
            params.push(filtros.fechaInicio, filtros.fechaFin);
        }

        query += ' ORDER BY fecha_orden DESC';

        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [ordenes] = await db.query(query, params);
        return ordenes;
    }

    // Obtener órdenes de un cliente
    static async obtenerPorCliente(clienteDni) {
        const [ordenes] = await db.query(
            `SELECT * FROM ordenes 
             WHERE cliente_dni = ? AND activo = TRUE 
             ORDER BY fecha_orden DESC`,
            [clienteDni]
        );

        // Agregar productos a cada orden
        for (const orden of ordenes) {
            const [productos] = await db.query(
                'SELECT * FROM ordenes_detalle WHERE orden_id = ?',
                [orden.id]
            );
            orden.productos = productos;
        }

        return ordenes;
    }

    // Actualizar estado de orden
    static async actualizarEstado(id, nuevoEstado) {
        const [resultado] = await db.query(
            'UPDATE ordenes SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nuevoEstado, id]
        );
        return resultado.affectedRows;
    }

    // Cancelar orden
    static async cancelar(id) {
        const [resultado] = await db.query(
            'UPDATE ordenes SET estado = "cancelado", activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return resultado.affectedRows;
    }

    // Estadísticas de órdenes
    static async obtenerEstadisticas(periodo = 'dia') {
        let condicionFecha = '';

        switch (periodo) {
            case 'dia':
                condicionFecha = 'DATE(fecha_orden) = CURDATE()';
                break;
            case 'semana':
                condicionFecha = 'YEARWEEK(fecha_orden) = YEARWEEK(NOW())';
                break;
            case 'mes':
                condicionFecha = 'YEAR(fecha_orden) = YEAR(NOW()) AND MONTH(fecha_orden) = MONTH(NOW())';
                break;
            case 'año':
                condicionFecha = 'YEAR(fecha_orden) = YEAR(NOW())';
                break;
            default:
                condicionFecha = '1=1';
        }

        const [estadisticas] = await db.query(`
            SELECT 
                COUNT(*) as total_ordenes,
                SUM(total) as ingresos_totales,
                AVG(total) as ticket_promedio,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as ordenes_completadas,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as ordenes_pendientes
            FROM ordenes 
            WHERE activo = TRUE AND ${condicionFecha}
        `);

        return estadisticas[0];
    }

    // Top productos más vendidos (desde órdenes)
    static async topProductos(limite = 10) {
        const [productos] = await db.query(`
            SELECT 
                od.producto_id,
                od.producto_nombre,
                od.producto_categoria,
                SUM(od.cantidad) as total_vendido,
                COUNT(DISTINCT od.orden_id) as veces_vendido,
                SUM(od.subtotal) as ingresos_generados,
                AVG(od.precio_unitario) as precio_promedio
            FROM ordenes_detalle od
            INNER JOIN ordenes o ON od.orden_id = o.id
            WHERE o.activo = TRUE AND o.estado != 'cancelado'
            GROUP BY od.producto_id, od.producto_nombre, od.producto_categoria
            ORDER BY total_vendido DESC
            LIMIT ?
        `, [limite]);

        return productos;
    }
}

module.exports = OrdenModel;