const UsuarioModel = require('../models/usuario.model');
const TokenModel = require('../models/token.model');
const JwtUtil = require('../utils/jwt.util');

class AuthController {

    // POST /api/auth/register
    static async registrar(req, res) {
        try {
            const { email, password, nombre, apellido, rol } = req.body;

            // Validaciones
            if (!email || !password || !nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, contraseña, nombre y apellido son obligatorios'
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Verificar si el email ya existe
            const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Crear usuario (por defecto rol 'cliente' si no se especifica)
            const usuarioId = await UsuarioModel.crear({
                email,
                password,
                nombre,
                apellido,
                rol: rol || 'cliente'
            });

            const nuevoUsuario = await UsuarioModel.buscarPorId(usuarioId);

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: nuevoUsuario
            });

        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    }

    // POST /api/auth/login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validaciones
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son obligatorios'
                });
            }

            // Buscar usuario
            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si está activo
            if (!usuario.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario desactivado'
                });
            }

            // Verificar contraseña
            const passwordValida = await UsuarioModel.verificarPassword(password, usuario.password);
            if (!passwordValida) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar tokens
            const payload = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            };

            const accessToken = JwtUtil.generarAccessToken(payload);
            const refreshToken = JwtUtil.generarRefreshToken(payload);

            // Guardar refresh token en BD
            const expiraEn = new Date();
            expiraEn.setDate(expiraEn.getDate() + 7); // 7 días
            await TokenModel.guardar(usuario.id, refreshToken, expiraEn);

            // Actualizar último login
            await UsuarioModel.actualizarUltimoLogin(usuario.id);

            // Obtener usuario actualizado (sin password)
            const usuarioActualizado = await UsuarioModel.buscarPorId(usuario.id);

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    usuario: usuarioActualizado,
                    accessToken,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el login',
                error: error.message
            });
        }
    }

    // POST /api/auth/refresh
    static async refrescarToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token es obligatorio'
                });
            }

            // Verificar refresh token
            const decoded = JwtUtil.verificarRefreshToken(refreshToken);

            // Buscar token en BD
            const tokenDB = await TokenModel.buscar(refreshToken);
            if (!tokenDB) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token inválido o expirado'
                });
            }

            // Buscar usuario
            const usuario = await UsuarioModel.buscarPorId(decoded.id);
            if (!usuario || !usuario.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado o desactivado'
                });
            }

            // Generar nuevo access token
            const payload = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            };

            const nuevoAccessToken = JwtUtil.generarAccessToken(payload);

            res.json({
                success: true,
                message: 'Token refrescado exitosamente',
                data: {
                    accessToken: nuevoAccessToken
                }
            });

        } catch (error) {
            console.error('Error al refrescar token:', error);
            res.status(401).json({
                success: false,
                message: 'Error al refrescar token',
                error: error.message
            });
        }
    }

    // POST /api/auth/logout
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await TokenModel.eliminar(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logout exitoso'
            });

        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el logout',
                error: error.message
            });
        }
    }

    // GET /api/auth/me
    static async obtenerPerfil(req, res) {
        try {
            // req.usuario viene del middleware
            res.json({
                success: true,
                data: req.usuario
            });

        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;