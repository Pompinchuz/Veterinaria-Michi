const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioModel {
    
    // Crear nuevo usuario
    static async crear(datosUsuario) {
        const { email, password, nombre, apellido, rol } = datosUsuario;
        
        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)',
            [email, passwordHash, nombre, apellido, rol]
        );
        
        return result.insertId;
    }

    // Buscar usuario por email
    static async buscarPorEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Buscar usuario por ID
    static async buscarPorId(id) {
        const [rows] = await db.query(
            'SELECT id, email, nombre, apellido, rol, activo, email_verificado, ultimo_login, created_at FROM usuarios WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Verificar contraseña
    static async verificarPassword(password, passwordHash) {
        return await bcrypt.compare(password, passwordHash);
    }

    // Actualizar último login
    static async actualizarUltimoLogin(usuarioId) {
        await db.query(
            'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
            [usuarioId]
        );
    }

    // Obtener todos los usuarios (sin passwords)
    static async obtenerTodos() {
        const [rows] = await db.query(
            'SELECT id, email, nombre, apellido, rol, activo, email_verificado, ultimo_login, created_at FROM usuarios ORDER BY created_at DESC'
        );
        return rows;
    }

    // Obtener usuarios por rol
    static async obtenerPorRol(rol) {
        const [rows] = await db.query(
            'SELECT id, email, nombre, apellido, rol, activo, email_verificado, ultimo_login, created_at FROM usuarios WHERE rol = ? ORDER BY nombre',
            [rol]
        );
        return rows;
    }

    // Actualizar usuario
    static async actualizar(id, datosUsuario) {
        const campos = [];
        const valores = [];

        if (datosUsuario.nombre !== undefined) {
            campos.push('nombre = ?');
            valores.push(datosUsuario.nombre);
        }
        if (datosUsuario.apellido !== undefined) {
            campos.push('apellido = ?');
            valores.push(datosUsuario.apellido);
        }
        if (datosUsuario.rol !== undefined) {
            campos.push('rol = ?');
            valores.push(datosUsuario.rol);
        }
        if (datosUsuario.activo !== undefined) {
            campos.push('activo = ?');
            valores.push(datosUsuario.activo);
        }

        if (campos.length === 0) {
            return 0;
        }

        valores.push(id);

        const [result] = await db.query(
            `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
            valores
        );
        
        return result.affectedRows;
    }

    // Cambiar contraseña
    static async cambiarPassword(id, nuevaPassword) {
        const passwordHash = await bcrypt.hash(nuevaPassword, 10);
        
        const [result] = await db.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [passwordHash, id]
        );
        
        return result.affectedRows;
    }

    // Eliminar usuario (soft delete)
    static async eliminar(id) {
        const [result] = await db.query(
            'UPDATE usuarios SET activo = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = UsuarioModel;