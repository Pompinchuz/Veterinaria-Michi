const db = require('../config/database');

class VentaModel {

    // Crear nueva venta
    static async crear(ventaData) {
        const {
            producto_id,
            producto_nombre,
            producto_categoria,
            cantidad,
            precio_unitario,
            precio_total,
            cliente_dni,
            cliente_nombre,
            vendedor_id,
            vendedor_nombre,
            metodo_pago,
            observaciones
        } = ventaData;

        const [resultado] = await db.query(
            `INSERT INTO ventas (
                producto_id, producto_nombre, producto_categoria, cantidad, 
                precio_unitario, precio_total, cliente_dni, cliente_nombre, 
                vendedor_id, vendedor_nombre, metodo_pago, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                producto_id,
                producto_nombre,
                producto_categoria || null,
                cantidad,
                precio_unitario,
                precio_total,
                cliente_dni || null,
                cliente_nombre || null,
                vendedor_id || null,
                vendedor_nombre || null,
                metodo_pago,
                observaciones || null
            ]
        );

        return resultado.insertId;
    }

    // Obtener todas las ventas
    static async obtenerTodas(filtros = {}) {
        let query = 'SELECT * FROM ventas WHERE activo = TRUE';
        const params = [];

        if (filtros.fechaInicio && filtros.fechaFin) {
            query += ' AND DATE(fecha_venta) BETWEEN ? AND ?';
            params.push(filtros.fechaInicio, filtros.fechaFin);
        }

        if (filtros.producto_id) {
            query += ' AND producto_id = ?';
            params.push(filtros.producto_id);
        }

        if (filtros.cliente_dni) {
            query += ' AND cliente_dni = ?';
            params.push(filtros.cliente_dni);
        }

        if (filtros.metodo_pago) {
            query += ' AND metodo_pago = ?';
            params.push(filtros.metodo_pago);
        }

        query += ' ORDER BY fecha_venta DESC';

        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [ventas] = await db.query(query, params);
        return ventas;
    }

    // Obtener venta por ID
    static async obtenerPorId(id) {
        const [ventas] = await db.query(
            'SELECT * FROM ventas WHERE id = ?',
            [id]
        );
        return ventas[0];
    }

    // Anular venta (soft delete)
    static async anular(id) {
        const [resultado] = await db.query(
            'UPDATE ventas SET activo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return resultado.affectedRows;
    }

    // Estadísticas generales
    static async obtenerEstadisticas(periodo = 'dia') {
        let condicionFecha = '';

        switch (periodo) {
            case 'dia':
                condicionFecha = 'DATE(fecha_venta) = CURDATE()';
                break;
            case 'semana':
                condicionFecha = 'YEARWEEK(fecha_venta) = YEARWEEK(NOW())';
                break;
            case 'mes':
                condicionFecha = 'YEAR(fecha_venta) = YEAR(NOW()) AND MONTH(fecha_venta) = MONTH(NOW())';
                break;
            case 'año':
                condicionFecha = 'YEAR(fecha_venta) = YEAR(NOW())';
                break;
            default:
                condicionFecha = '1=1'; // todas
        }

        const [estadisticas] = await db.query(`
            SELECT 
                COUNT(*) as total_ventas,
                SUM(cantidad) as total_productos_vendidos,
                SUM(precio_total) as ingresos_totales,
                AVG(precio_total) as ticket_promedio
            FROM ventas 
            WHERE activo = TRUE AND ${condicionFecha}
        `);

        return estadisticas[0];
    }

    // Top productos más vendidos
    static async topProductos(limite = 10) {
        const [productos] = await db.query(`
            SELECT 
                producto_id,
                producto_nombre,
                producto_categoria,
                SUM(cantidad) as total_vendido,
                COUNT(*) as veces_vendido,
                SUM(precio_total) as ingresos_generados,
                AVG(precio_unitario) as precio_promedio
            FROM ventas 
            WHERE activo = TRUE
            GROUP BY producto_id, producto_nombre, producto_categoria
            ORDER BY total_vendido DESC
            LIMIT ?
        `, [limite]);

        return productos;
    }

    // Ventas por producto específico
    static async ventasPorProducto(productoId) {
        const [ventas] = await db.query(`
            SELECT 
                COUNT(*) as veces_vendido,
                SUM(cantidad) as total_vendido,
                SUM(precio_total) as ingresos_totales,
                MIN(fecha_venta) as primera_venta,
                MAX(fecha_venta) as ultima_venta
            FROM ventas 
            WHERE producto_id = ? AND activo = TRUE
        `, [productoId]);

        return ventas[0];
    }

    // Ventas por método de pago
    static async ventasPorMetodoPago() {
        const [metodos] = await db.query(`
            SELECT 
                metodo_pago,
                COUNT(*) as total_ventas,
                SUM(precio_total) as total_ingresos
            FROM ventas 
            WHERE activo = TRUE
            GROUP BY metodo_pago
            ORDER BY total_ingresos DESC
        `);

        return metodos;
    }

    // Ventas del día
    static async ventasDelDia() {
        const [ventas] = await db.query(`
            SELECT * FROM ventas
            WHERE DATE(fecha_venta) = CURDATE()
            AND activo = TRUE
            ORDER BY fecha_venta DESC
        `);

        return ventas;
    }

    // Ventas agrupadas por día (para gráficos)
    static async ventasPorDia(dias = 30) {
        const [ventas] = await db.query(`
            SELECT
                DATE(fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(cantidad) as productos_vendidos,
                SUM(precio_total) as ingresos,
                AVG(precio_total) as ticket_promedio
            FROM ventas
            WHERE activo = TRUE
            AND fecha_venta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha ASC
        `, [dias]);

        return ventas;
    }

    // Ventas por método de pago en un período
    static async ventasPorMetodoPagoPeriodo(dias = 30) {
        const [metodos] = await db.query(`
            SELECT
                metodo_pago,
                COUNT(*) as total_ventas,
                SUM(precio_total) as total_ingresos,
                AVG(precio_total) as ticket_promedio
            FROM ventas
            WHERE activo = TRUE
            AND fecha_venta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY metodo_pago
            ORDER BY total_ingresos DESC
        `, [dias]);

        return metodos;
    }

    // Ventas por categoría de producto
    static async ventasPorCategoria(dias = 30) {
        const [categorias] = await db.query(`
            SELECT
                producto_categoria as categoria,
                COUNT(*) as total_ventas,
                SUM(cantidad) as productos_vendidos,
                SUM(precio_total) as ingresos
            FROM ventas
            WHERE activo = TRUE
            AND fecha_venta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY producto_categoria
            ORDER BY ingresos DESC
        `, [dias]);

        return categorias;
    }

    // Resumen de ventas por hora del día
    static async ventasPorHora(dias = 7) {
        const [horas] = await db.query(`
            SELECT
                HOUR(fecha_venta) as hora,
                COUNT(*) as total_ventas,
                SUM(precio_total) as ingresos
            FROM ventas
            WHERE activo = TRUE
            AND fecha_venta >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY HOUR(fecha_venta)
            ORDER BY hora ASC
        `, [dias]);

        return horas;
    }
}

module.exports = VentaModel;