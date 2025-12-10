const db = require('../config/database');

class FacturaModel {

    // Crear nueva factura electrónica
    static async crear(facturaData) {
        const {
            tipo_transaccion,        // 'venta' u 'orden'
            referencia_id,           // venta_id u orden_id
            cliente_dni,
            cliente_nombre,
            cliente_email,
            cliente_direccion,
            subtotal,
            igv,                     // Impuesto General a las Ventas (18% en Perú)
            total,
            metodo_pago,
            detalles,                // Array de productos
            observaciones
        } = facturaData;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Obtener el siguiente número de factura
            const [resultado] = await connection.query(
                'SELECT COALESCE(MAX(numero_factura), 0) + 1 as siguiente_numero FROM facturas'
            );
            const numero_factura = resultado[0].siguiente_numero;

            // Generar número de factura con formato: F001-00000001
            const numero_factura_formateado = `F001-${String(numero_factura).padStart(8, '0')}`;

            // 2. Crear la factura
            const [resultadoFactura] = await connection.query(
                `INSERT INTO facturas (
                    numero_factura,
                    numero_factura_formateado,
                    tipo_transaccion,
                    referencia_id,
                    cliente_dni,
                    cliente_nombre,
                    cliente_email,
                    cliente_direccion,
                    subtotal,
                    igv,
                    total,
                    metodo_pago,
                    observaciones,
                    estado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'emitida')`,
                [
                    numero_factura,
                    numero_factura_formateado,
                    tipo_transaccion,
                    referencia_id,
                    cliente_dni,
                    cliente_nombre || 'Cliente General',
                    cliente_email || null,
                    cliente_direccion || null,
                    subtotal,
                    igv,
                    total,
                    metodo_pago,
                    observaciones || null
                ]
            );

            const facturaId = resultadoFactura.insertId;

            // 3. Crear los detalles de la factura (productos/servicios)
            if (detalles && detalles.length > 0) {
                for (const detalle of detalles) {
                    await connection.query(
                        `INSERT INTO facturas_detalle (
                            factura_id,
                            producto_id,
                            descripcion,
                            cantidad,
                            precio_unitario,
                            subtotal
                        ) VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            facturaId,
                            detalle.producto_id || null,
                            detalle.descripcion,
                            detalle.cantidad,
                            detalle.precio_unitario,
                            detalle.subtotal
                        ]
                    );
                }
            }

            await connection.commit();
            return facturaId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener factura por ID con sus detalles
    static async obtenerPorId(id) {
        const [facturas] = await db.query(
            'SELECT * FROM facturas WHERE id = ?',
            [id]
        );

        if (facturas.length === 0) return null;

        const factura = facturas[0];

        // Obtener detalles de la factura
        const [detalles] = await db.query(
            'SELECT * FROM facturas_detalle WHERE factura_id = ?',
            [id]
        );

        factura.detalles = detalles;
        return factura;
    }

    // Obtener factura por número de factura
    static async obtenerPorNumero(numeroFactura) {
        const [facturas] = await db.query(
            'SELECT * FROM facturas WHERE numero_factura_formateado = ?',
            [numeroFactura]
        );

        if (facturas.length === 0) return null;

        const factura = facturas[0];

        // Obtener detalles de la factura
        const [detalles] = await db.query(
            'SELECT * FROM facturas_detalle WHERE factura_id = ?',
            [factura.id]
        );

        factura.detalles = detalles;
        return factura;
    }

    // Obtener factura por referencia (venta_id u orden_id)
    static async obtenerPorReferencia(tipoTransaccion, referenciaId) {
        const [facturas] = await db.query(
            'SELECT * FROM facturas WHERE tipo_transaccion = ? AND referencia_id = ?',
            [tipoTransaccion, referenciaId]
        );

        if (facturas.length === 0) return null;

        const factura = facturas[0];

        // Obtener detalles de la factura
        const [detalles] = await db.query(
            'SELECT * FROM facturas_detalle WHERE factura_id = ?',
            [factura.id]
        );

        factura.detalles = detalles;
        return factura;
    }

    // Obtener todas las facturas con filtros
    static async obtenerTodas(filtros = {}) {
        let query = 'SELECT * FROM facturas WHERE 1=1';
        const params = [];

        if (filtros.cliente_dni) {
            query += ' AND cliente_dni = ?';
            params.push(filtros.cliente_dni);
        }

        if (filtros.estado) {
            query += ' AND estado = ?';
            params.push(filtros.estado);
        }

        if (filtros.tipo_transaccion) {
            query += ' AND tipo_transaccion = ?';
            params.push(filtros.tipo_transaccion);
        }

        if (filtros.fechaInicio && filtros.fechaFin) {
            query += ' AND DATE(fecha_emision) BETWEEN ? AND ?';
            params.push(filtros.fechaInicio, filtros.fechaFin);
        }

        query += ' ORDER BY fecha_emision DESC';

        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [facturas] = await db.query(query, params);
        return facturas;
    }

    // Obtener facturas de un cliente
    static async obtenerPorCliente(clienteDni) {
        const [facturas] = await db.query(
            `SELECT * FROM facturas
             WHERE cliente_dni = ?
             ORDER BY fecha_emision DESC`,
            [clienteDni]
        );

        // Agregar detalles a cada factura
        for (const factura of facturas) {
            const [detalles] = await db.query(
                'SELECT * FROM facturas_detalle WHERE factura_id = ?',
                [factura.id]
            );
            factura.detalles = detalles;
        }

        return facturas;
    }

    // Anular factura
    static async anular(id, motivo) {
        const [resultado] = await db.query(
            `UPDATE facturas
             SET estado = 'anulada',
                 observaciones = CONCAT(COALESCE(observaciones, ''), ' | ANULADA: ', ?),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [motivo || 'Sin motivo especificado', id]
        );
        return resultado.affectedRows;
    }

    // Estadísticas de facturas
    static async obtenerEstadisticas(periodo = 'mes') {
        let condicionFecha = '';

        switch (periodo) {
            case 'dia':
                condicionFecha = 'DATE(fecha_emision) = CURDATE()';
                break;
            case 'semana':
                condicionFecha = 'YEARWEEK(fecha_emision) = YEARWEEK(NOW())';
                break;
            case 'mes':
                condicionFecha = 'YEAR(fecha_emision) = YEAR(NOW()) AND MONTH(fecha_emision) = MONTH(NOW())';
                break;
            case 'año':
                condicionFecha = 'YEAR(fecha_emision) = YEAR(NOW())';
                break;
            default:
                condicionFecha = '1=1';
        }

        const [estadisticas] = await db.query(`
            SELECT
                COUNT(*) as total_facturas,
                SUM(CASE WHEN estado = 'emitida' THEN 1 ELSE 0 END) as facturas_emitidas,
                SUM(CASE WHEN estado = 'anulada' THEN 1 ELSE 0 END) as facturas_anuladas,
                SUM(CASE WHEN estado = 'emitida' THEN total ELSE 0 END) as total_facturado,
                AVG(CASE WHEN estado = 'emitida' THEN total ELSE NULL END) as ticket_promedio
            FROM facturas
            WHERE ${condicionFecha}
        `);

        return estadisticas[0];
    }

    // Facturas del día
    static async facturasDelDia() {
        const [facturas] = await db.query(`
            SELECT * FROM facturas
            WHERE DATE(fecha_emision) = CURDATE()
            ORDER BY fecha_emision DESC
        `);

        return facturas;
    }

    // Obtener última factura emitida
    static async obtenerUltima() {
        const [facturas] = await db.query(
            'SELECT * FROM facturas ORDER BY id DESC LIMIT 1'
        );

        if (facturas.length === 0) return null;

        const factura = facturas[0];

        // Obtener detalles de la factura
        const [detalles] = await db.query(
            'SELECT * FROM facturas_detalle WHERE factura_id = ?',
            [factura.id]
        );

        factura.detalles = detalles;
        return factura;
    }
}

module.exports = FacturaModel;
