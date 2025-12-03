const db = require('../config/database');

class ClienteModel {
    
    // Obtener todos los clientes
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM clientes ORDER BY created_at DESC');
        return rows;
    }

    // Buscar cliente por DNI (⭐ Requisito principal)
    static async getByDni(dni) {
        const [rows] = await db.query('SELECT * FROM clientes WHERE dni = ?', [dni]);
        return rows[0];
    }

    // Buscar cliente por ID
    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
        return rows[0];
    }

    // Crear nuevo cliente
    static async create(clienteData) {
        const { dni, nombres, apellidos, telefono, email, direccion } = clienteData;
        const [result] = await db.query(
            'INSERT INTO clientes (dni, nombres, apellidos, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [dni, nombres, apellidos, telefono, email, direccion]
        );
        return result.insertId;
    }

    // Actualizar cliente
    static async update(id, clienteData) {
        const { nombres, apellidos, telefono, email, direccion } = clienteData;
        const [result] = await db.query(
            'UPDATE clientes SET nombres = ?, apellidos = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?',
            [nombres, apellidos, telefono, email, direccion, id]
        );
        return result.affectedRows;
    }

    // Eliminar cliente
    static async delete(id) {
        const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ClienteModel;