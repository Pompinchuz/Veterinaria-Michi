const UsuarioModel = require('../models/usuario.model');

class UsuariosController {

    // GET /api/usuarios
    static async obtenerTodosUsuarios(req, res) {
        try {
            const { rol } = req.query;

            let usuarios;
            if (rol) {
                usuarios = await UsuarioModel.obtenerPorRol(rol);
            } else {
                usuarios = await UsuarioModel.obtenerTodos();
            }

            res.json({
                success: true,
                data: usuarios,
                count: usuarios.length
            });

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    }

    // GET /api/usuarios/:id
    static async obtenerUsuarioPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioModel.buscarPorId(id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró usuario con ID: ${id}`
                });
            }

            res.json({
                success: true,
                data: usuario
            });

        } catch (error) {
            console.error('Error al buscar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar usuario',
                error: error.message
            });
        }
    }

    // PUT /api/usuarios/:id
    static async actualizarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { nombre, apellido, rol, activo } = req.body;

            // Verificar que el usuario existe
            const usuarioExistente = await UsuarioModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró usuario con ID: ${id}`
                });
            }

            // Solo admin puede cambiar roles o activar/desactivar
            if ((rol || activo !== undefined) && req.usuario.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden cambiar roles o estado de usuarios'
                });
            }

            const affectedRows = await UsuarioModel.actualizar(id, req.body);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el usuario'
                });
            }

            const usuarioActualizado = await UsuarioModel.buscarPorId(id);

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: usuarioActualizado
            });

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    }

    // PUT /api/usuarios/:id/password
    static async cambiarPassword(req, res) {
        try {
            const { id } = req.params;
            const { passwordActual, nuevaPassword } = req.body;

            // Validaciones
            if (!passwordActual || !nuevaPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son obligatorias'
                });
            }

            if (nuevaPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            // Verificar que el usuario solo pueda cambiar su propia contraseña (a menos que sea admin)
            if (req.usuario.rol !== 'admin' && req.usuario.id !== parseInt(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes cambiar tu propia contraseña'
                });
            }

            // Buscar usuario completo (con password)
            const usuarioCompleto = await UsuarioModel.buscarPorEmail(
                (await UsuarioModel.buscarPorId(id)).email
            );

            if (!usuarioCompleto) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual (solo si no es admin cambiando otra contraseña)
            if (req.usuario.id === parseInt(id)) {
                const passwordValida = await UsuarioModel.verificarPassword(
                    passwordActual, 
                    usuarioCompleto.password
                );

                if (!passwordValida) {
                    return res.status(401).json({
                        success: false,
                        message: 'Contraseña actual incorrecta'
                    });
                }
            }

            // Cambiar contraseña
            await UsuarioModel.cambiarPassword(id, nuevaPassword);

            res.json({
                success: true,
                message: 'Contraseña cambiada exitosamente'
            });

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar contraseña',
                error: error.message
            });
        }
    }

    // DELETE /api/usuarios/:id
    static async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;

            // No permitir que un usuario se elimine a sí mismo
            if (req.usuario.id === parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propio usuario'
                });
            }

            const usuario = await UsuarioModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró usuario con ID: ${id}`
                });
            }

            const affectedRows = await UsuarioModel.eliminar(id);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el usuario'
                });
            }

            res.json({
                success: true,
                message: 'Usuario desactivado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    }
}

module.exports = UsuariosController;