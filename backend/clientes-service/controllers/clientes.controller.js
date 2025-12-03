const ClienteModel = require('../models/cliente.model');
const db = require('../config/database');

class ClientesController {

    // GET /api/clientes
    static async getAllClientes(req, res) {
        try {
            const clientes = await ClienteModel.getAll();
            res.json({
                success: true,
                data: clientes,
                count: clientes.length
            });
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener clientes',
                error: error.message
            });
        }
    }

    // ⭐ NUEVO: GET /api/clientes/mi-perfil
    static async getMiPerfil(req, res) {
        try {
            // Buscar cliente por email del token
            const [cliente] = await db.query(
                'SELECT * FROM clientes WHERE email = ? AND activo = TRUE',
                [req.usuario.email]
            );

            if (cliente.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró tu perfil de cliente. Por favor, completa tu registro.'
                });
            }

            res.json({
                success: true,
                data: cliente[0]
            });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tu perfil',
                error: error.message
            });
        }
    }

    // GET /api/clientes/dni/:dni ⭐ REQUISITO PRINCIPAL
    static async getClienteByDni(req, res) {
        try {
            const { dni } = req.params;
            const cliente = await ClienteModel.getByDni(dni);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con DNI: ${dni}`
                });
            }

            res.json({
                success: true,
                data: cliente
            });
        } catch (error) {
            console.error('Error al buscar cliente por DNI:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar cliente',
                error: error.message
            });
        }
    }

    // GET /api/clientes/:id
    static async getClienteById(req, res) {
        try {
            const { id } = req.params;
            const cliente = await ClienteModel.getById(id);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con ID: ${id}`
                });
            }

            res.json({
                success: true,
                data: cliente
            });
        } catch (error) {
            console.error('Error al buscar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar cliente',
                error: error.message
            });
        }
    }

    // POST /api/clientes
    static async createCliente(req, res) {
        try {
            const { dni, nombres, apellidos, telefono, email, direccion } = req.body;

            // Validar campos obligatorios
            if (!dni || !nombres || !apellidos) {
                return res.status(400).json({
                    success: false,
                    message: 'DNI, nombres y apellidos son obligatorios'
                });
            }

            // ⭐ Si es un cliente creando su propio perfil, validar que el email coincida
            if (req.usuario.rol === 'cliente') {
                if (email !== req.usuario.email) {
                    return res.status(403).json({
                        success: false,
                        message: 'Solo puedes crear un perfil con tu propio email'
                    });
                }
            }

            // Verificar si ya existe cliente con ese DNI
            const [clienteExistente] = await db.query(
                'SELECT * FROM clientes WHERE dni = ?',
                [dni]
            );

            if (clienteExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un cliente con ese DNI'
                });
            }

            // Crear el cliente
            const [resultado] = await db.query(
                'INSERT INTO clientes (dni, nombres, apellidos, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)',
                [dni, nombres, apellidos, telefono || null, email || null, direccion || null]
            );

            // Obtener el cliente creado
            const [nuevoCliente] = await db.query(
                'SELECT * FROM clientes WHERE id = ?',
                [resultado.insertId]
            );

            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: nuevoCliente[0]
            });

        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear cliente',
                error: error.message
            });
        }
    }

    // PUT /api/clientes/:id
    static async updateCliente(req, res) {
        try {
            const { id } = req.params;
            const { nombres, apellidos, telefono, email, direccion } = req.body;

            // Verificar si el cliente existe
            const clienteExistente = await ClienteModel.getById(id);
            if (!clienteExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con ID: ${id}`
                });
            }

            const affectedRows = await ClienteModel.update(id, req.body);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el cliente'
                });
            }

            const clienteActualizado = await ClienteModel.getById(id);

            res.json({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: clienteActualizado
            });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar cliente',
                error: error.message
            });
        }
    }

    // DELETE /api/clientes/:id
    static async deleteCliente(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el cliente existe
            const clienteExistente = await ClienteModel.getById(id);
            if (!clienteExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con ID: ${id}`
                });
            }

            const affectedRows = await ClienteModel.delete(id);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el cliente'
                });
            }

            res.json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar cliente',
                error: error.message
            });
        }
    }
}

module.exports = ClientesController;