const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto_jwt_veterinaria_2024_cambiar_en_produccion';

class AuthMiddleware {
    
    static verificarToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            console.log('🔑 Headers recibidos:', req.headers); // ⭐ LOG
        console.log('🔑 Authorization header:', authHeader); // ⭐ LOG
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'Token no proporcionado'
                });
            }

            const token = authHeader.substring(7);
                    console.log('🔑 Token extraído:', token.substring(0, 20) + '...'); // ⭐ LOG

            const decoded = jwt.verify(token, JWT_SECRET);
                    console.log('✅ Token válido, usuario:', decoded); // ⭐ LOG


            req.usuario = decoded;
            next();

        } catch (error) {
            console.error('Error en verificación de token:', error);
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
                error: error.message
            });
        }
    }

    static verificarRol(rolesPermitidos) {
        return (req, res, next) => {
            if (!req.usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'No autenticado'
                });
            }

            if (!rolesPermitidos.includes(req.usuario.rol)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso',
                    rolRequerido: rolesPermitidos,
                    tuRol: req.usuario.rol
                });
            }

            next();
        };
    }

    static esAdmin(req, res, next) {
        return AuthMiddleware.verificarRol(['admin'])(req, res, next);
    }

    static esPersonal(req, res, next) {
        return AuthMiddleware.verificarRol(['admin', 'veterinario', 'enfermera', 'recepcionista'])(req, res, next);
    }
}

module.exports = AuthMiddleware;