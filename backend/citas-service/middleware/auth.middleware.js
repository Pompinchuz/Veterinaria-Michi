const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_super_secreto_jwt_veterinaria_2024_cambiar_en_produccion';

class AuthMiddleware {
    
    // Verificar que el usuario está autenticado
    static verificarToken(req, res, next) {
        try {
            // Obtener token del header
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    success: false,
                    message: 'Token no proporcionado'
                });
            }

            // Extraer token
            const token = authHeader.substring(7); // Remover "Bearer "

            // Verificar token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Agregar usuario al request
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

    // Verificar roles permitidos
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

    // Verificar que el usuario es admin
    static esAdmin(req, res, next) {
        return AuthMiddleware.verificarRol(['admin'])(req, res, next);
    }

    // Verificar que es veterinario o admin
    static esVeterinarioOAdmin(req, res, next) {
        return AuthMiddleware.verificarRol(['admin', 'veterinario'])(req, res, next);
    }

    // Verificar que es personal (veterinario, enfermera, admin, recepcionista)
    static esPersonal(req, res, next) {
        return AuthMiddleware.verificarRol(['admin', 'veterinario', 'enfermera', 'recepcionista'])(req, res, next);
    }

    // Verificar que es personal O cliente (para operaciones donde el cliente puede ver sus propios recursos)
    static esPersonalOCliente(req, res, next) {
        return AuthMiddleware.verificarRol(['admin', 'veterinario', 'enfermera', 'recepcionista', 'cliente'])(req, res, next);
    }

    // Verificar que el cliente solo accede a sus propios recursos
    // NOTA: Este middleware permite el acceso, pero el controlador debe validar
    // que el cliente solo accede a sus propios datos consultando la BD
    static verificarAccesoCliente(req, res, next) {
        const usuario = req.usuario;

        // Si es personal, tiene acceso completo
        if (['admin', 'veterinario', 'enfermera', 'recepcionista'].includes(usuario.rol)) {
            return next();
        }

        // Si es cliente, marcar en el request que es un cliente
        // El controlador se encargará de filtrar solo sus datos
        if (usuario.rol === 'cliente') {
            req.esCliente = true;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso'
        });
    }
}

module.exports = AuthMiddleware;