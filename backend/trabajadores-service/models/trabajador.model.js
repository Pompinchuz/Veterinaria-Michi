const db = require('../config/database');

class TrabajadorModel {
    
    // Obtener todos los trabajadores
    static async obtenerTodos() {
        const [rows] = await db.query(
            'SELECT * FROM trabajadores WHERE activo = TRUE ORDER BY apellidos, nombres'
        );
        return rows;
    }

    // Obtener trabajadores por cargo
    static async obtenerPorCargo(cargo) {
        const [rows] = await db.query(
            'SELECT * FROM trabajadores WHERE cargo = ? AND activo = TRUE ORDER BY apellidos, nombres',
            [cargo]
        );
        return rows;
    }

    // Buscar trabajador por DNI
    static async obtenerPorDni(dni) {
        const [rows] = await db.query(
            'SELECT * FROM trabajadores WHERE dni = ?',
            [dni]
        );
        return rows[0];
    }

    // Buscar trabajador por ID
    static async obtenerPorId(id) {
        const [rows] = await db.query(
            'SELECT * FROM trabajadores WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Buscar trabajador por email
    static async obtenerPorEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM trabajadores WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Crear nuevo trabajador
    static async crear(datosTrabjador) {
        const { 
            dni, nombres, apellidos, cargo, especialidad, 
            telefono, email, direccion, fecha_ingreso, salario 
        } = datosTrabjador;
        
        const [result] = await db.query(
            `INSERT INTO trabajadores 
            (dni, nombres, apellidos, cargo, especialidad, telefono, email, direccion, fecha_ingreso, salario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dni, nombres, apellidos, cargo, especialidad, telefono, email, direccion, fecha_ingreso, salario]
        );
        return result.insertId;
    }

    // Actualizar trabajador
    static async actualizar(id, datosTrabajador) {
        const { 
            nombres, apellidos, cargo, especialidad, 
            telefono, email, direccion, salario 
        } = datosTrabajador;
        
        const [result] = await db.query(
            `UPDATE trabajadores 
            SET nombres = ?, apellidos = ?, cargo = ?, especialidad = ?, 
                telefono = ?, email = ?, direccion = ?, salario = ?
            WHERE id = ?`,
            [nombres, apellidos, cargo, especialidad, telefono, email, direccion, salario, id]
        );
        return result.affectedRows;
    }

    // Eliminar (soft delete) trabajador
    static async eliminar(id) {
        const [result] = await db.query(
            'UPDATE trabajadores SET activo = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Obtener horarios de un trabajador
    static async obtenerHorarios(trabajadorId) {
        const [rows] = await db.query(
            'SELECT * FROM horarios WHERE trabajador_id = ? AND activo = TRUE ORDER BY FIELD(dia_semana, "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo")',
            [trabajadorId]
        );
        return rows;
    }

    // Agregar horario a un trabajador
    static async agregarHorario(horarioData) {
        const { trabajador_id, dia_semana, hora_inicio, hora_fin } = horarioData;
        
        const [result] = await db.query(
            'INSERT INTO horarios (trabajador_id, dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)',
            [trabajador_id, dia_semana, hora_inicio, hora_fin]
        );
        return result.insertId;
    }

    // Eliminar horario
    static async eliminarHorario(horarioId) {
        const [result] = await db.query(
            'UPDATE horarios SET activo = FALSE WHERE id = ?',
            [horarioId]
        );
        return result.affectedRows;
    }

    // Obtener trabajador con sus horarios
    static async obtenerConHorarios(id) {
        const trabajador = await this.obtenerPorId(id);
        if (trabajador) {
            trabajador.horarios = await this.obtenerHorarios(id);
        }
        return trabajador;
    }
}

module.exports = TrabajadorModel;