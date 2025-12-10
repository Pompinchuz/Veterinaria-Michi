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

    // Verificar que es personal O cliente (para operaciones específicas)
    static esPersonalOCliente(req, res, next) {
        return AuthMiddleware.verificarRol(['admin', 'veterinario', 'enfermera', 'recepcionista', 'cliente'])(req, res, next);
    }

    // Verificar acceso a datos de cliente (personal puede ver todos, cliente solo los suyos)
    static verificarAccesoDatosCliente(req, res, next) {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado'
            });
        }

        console.log('🔍 Usuario accediendo a datos de cliente:', {
            email: req.usuario.email,
            rol: req.usuario.rol,
            dniSolicitado: req.params.dni
        });

        // Si es personal, puede acceder a todos los clientes
        if (['admin', 'veterinario', 'enfermera', 'recepcionista'].includes(req.usuario.rol)) {
            return next();
        }

        // Si es cliente, solo puede acceder a sus propios datos
        if (req.usuario.rol === 'cliente') {
            // Verificar que el DNI solicitado coincide con su DNI
            if (req.params.dni && req.params.dni !== req.usuario.dni) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes acceder a tu propia información'
                });
            }
            return next();
        }

        // Cualquier otro rol no tiene acceso
        return res.status(403).json({
            success: false,
            message: 'No tienes permisos para acceder a este recurso'
        });
    }
}

module.exports = AuthMiddleware;