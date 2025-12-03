const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE;

class JwtUtil {
    
    // Generar Access Token
    static generarAccessToken(payload) {
        return jwt.sign(payload, JWT_SECRET, { 
            expiresIn: JWT_EXPIRE 
        });
    }

    // Generar Refresh Token
    static generarRefreshToken(payload) {
        return jwt.sign(payload, JWT_REFRESH_SECRET, { 
            expiresIn: JWT_REFRESH_EXPIRE 
        });
    }

    // Verificar Access Token
    static verificarAccessToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    // Verificar Refresh Token
    static verificarRefreshToken(token) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (error) {
            throw new Error('Refresh token inválido o expirado');
        }
    }

    // Decodificar token sin verificar (útil para debug)
    static decodificarToken(token) {
        return jwt.decode(token);
    }
}

module.exports = JwtUtil;