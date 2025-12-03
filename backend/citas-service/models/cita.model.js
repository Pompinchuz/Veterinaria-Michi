const db = require('../config/database');

class CitaModel {
    
    // Obtener todas las citas
    static async obtenerTodas() {
        const [rows] = await db.query(
            'SELECT * FROM citas ORDER BY fecha DESC, hora DESC'
        );
        return rows;
    }

    // Obtener citas por estado
    static async obtenerPorEstado(estado) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE estado = ? ORDER BY fecha DESC, hora DESC',
            [estado]
        );
        return rows;
    }

    // Obtener citas por fecha
    static async obtenerPorFecha(fecha) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE fecha = ? ORDER BY hora',
            [fecha]
        );
        return rows;
    }

    // Obtener citas de un cliente
    static async obtenerPorCliente(clienteDni) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE cliente_dni = ? ORDER BY fecha DESC, hora DESC',
            [clienteDni]
        );
        return rows;
    }

    // Obtener citas de una mascota
    static async obtenerPorMascota(mascotaId) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE mascota_id = ? ORDER BY fecha DESC, hora DESC',
            [mascotaId]
        );
        return rows;
    }

    // Obtener citas de un veterinario
    static async obtenerPorVeterinario(veterinarioId) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE veterinario_id = ? ORDER BY fecha DESC, hora DESC',
            [veterinarioId]
        );
        return rows;
    }

    // Obtener cita por ID
    static async obtenerPorId(id) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Verificar disponibilidad (si ya existe una cita en esa fecha/hora con ese veterinario)
    static async verificarDisponibilidad(veterinarioId, fecha, hora, citaIdExcluir = null) {
        let query = 'SELECT COUNT(*) as total FROM citas WHERE veterinario_id = ? AND fecha = ? AND hora = ? AND estado NOT IN ("cancelada")';
        let params = [veterinarioId, fecha, hora];

        if (citaIdExcluir) {
            query += ' AND id != ?';
            params.push(citaIdExcluir);
        }

        const [rows] = await db.query(query, params);
        return rows[0].total === 0;
    }

    // Crear nueva cita
    static async crear(datosCita) {
        const { 
            cliente_dni, mascota_id, veterinario_id, 
            fecha, hora, motivo, observaciones 
        } = datosCita;
        
        const [result] = await db.query(
            `INSERT INTO citas 
            (cliente_dni, mascota_id, veterinario_id, fecha, hora, motivo, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cliente_dni, mascota_id, veterinario_id, fecha, hora, motivo, observaciones]
        );
        return result.insertId;
    }

    // Actualizar cita
    static async actualizar(id, datosCita) {
        const campos = [];
        const valores = [];

        // Construir query dinámicamente solo con los campos proporcionados
        if (datosCita.fecha !== undefined) {
            campos.push('fecha = ?');
            valores.push(datosCita.fecha);
        }
        if (datosCita.hora !== undefined) {
            campos.push('hora = ?');
            valores.push(datosCita.hora);
        }
        if (datosCita.veterinario_id !== undefined) {
            campos.push('veterinario_id = ?');
            valores.push(datosCita.veterinario_id);
        }
        if (datosCita.motivo !== undefined) {
            campos.push('motivo = ?');
            valores.push(datosCita.motivo);
        }
        if (datosCita.observaciones !== undefined) {
            campos.push('observaciones = ?');
            valores.push(datosCita.observaciones);
        }
        if (datosCita.diagnostico !== undefined) {
            campos.push('diagnostico = ?');
            valores.push(datosCita.diagnostico);
        }
        if (datosCita.tratamiento !== undefined) {
            campos.push('tratamiento = ?');
            valores.push(datosCita.tratamiento);
        }
        if (datosCita.costo !== undefined) {
            campos.push('costo = ?');
            valores.push(datosCita.costo);
        }

        if (campos.length === 0) {
            return 0;
        }

        valores.push(id);

        const [result] = await db.query(
            `UPDATE citas SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );
        return result.affectedRows;
    }

    // Cambiar estado de cita
    static async cambiarEstado(id, nuevoEstado) {
        const [result] = await db.query(
            'UPDATE citas SET estado = ? WHERE id = ?',
            [nuevoEstado, id]
        );
        return result.affectedRows;
    }

    // Cancelar cita
    static async cancelar(id) {
        return await this.cambiarEstado(id, 'cancelada');
    }

    // Obtener estadísticas
    static async obtenerEstadisticas() {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
                SUM(CASE WHEN estado = 'en_curso' THEN 1 ELSE 0 END) as en_curso,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN fecha = CURDATE() THEN 1 ELSE 0 END) as hoy
            FROM citas
        `);
        return rows[0];
    }
}

module.exports = CitaModel;