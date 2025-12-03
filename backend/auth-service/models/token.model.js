const db = require('../config/database');

class TokenModel {
    
    // Guardar refresh token
    static async guardar(usuarioId, refreshToken, expiraEn) {
        await db.query(
            'INSERT INTO tokens (usuario_id, refresh_token, expira_en) VALUES (?, ?, ?)',
            [usuarioId, refreshToken, expiraEn]
        );
    }

    // Buscar refresh token
    static async buscar(refreshToken) {
        const [rows] = await db.query(
            'SELECT * FROM tokens WHERE refresh_token = ? AND expira_en > NOW()',
            [refreshToken]
        );
        return rows[0];
    }

    // Eliminar refresh token (logout)
    static async eliminar(refreshToken) {
        const [result] = await db.query(
            'DELETE FROM tokens WHERE refresh_token = ?',
            [refreshToken]
        );
        return result.affectedRows;
    }

    // Eliminar todos los tokens de un usuario
    static async eliminarPorUsuario(usuarioId) {
        const [result] = await db.query(
            'DELETE FROM tokens WHERE usuario_id = ?',
            [usuarioId]
        );
        return result.affectedRows;
    }

    // Limpiar tokens expirados (tarea de mantenimiento)
    static async limpiarExpirados() {
        const [result] = await db.query(
            'DELETE FROM tokens WHERE expira_en < NOW()'
        );
        return result.affectedRows;
    }
}

module.exports = TokenModel;