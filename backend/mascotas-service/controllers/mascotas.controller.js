const Mascota = require('../models/mascota.model');
const ExternosService = require('../services/externos.service');

class MascotasController {

    // GET /api/mascotas
    // GET /api/mascotas
static async obtenerTodasMascotas(req, res) {
    try {
        let query = { activo: true };
        
        // ⭐ Si es cliente, solo mostrar sus propias mascotas
        if (req.usuario.rol === 'cliente') {
            // Necesitamos obtener el DNI del cliente por su email
            // Por ahora, el cliente NO debería llamar a este endpoint
            // Debería usar /api/mascotas/cliente/:dni directamente
            return res.status(403).json({
                success: false,
                message: 'Los clientes deben usar el endpoint /api/mascotas/cliente/:dni'
            });
        }

        const mascotas = await Mascota.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: mascotas,
            count: mascotas.length
        });
    } catch (error) {
        console.error('Error al obtener mascotas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mascotas',
            error: error.message
        });
    }
}

    // GET /api/mascotas/:id
    static async obtenerMascotaPorId(req, res) {
        try {
            const { id } = req.params;
            const mascota = await Mascota.findById(id);

            if (!mascota) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró mascota con ID: ${id}`
                });
            }

            // Si es cliente, verificar que la mascota le pertenece
            if (req.usuario.rol === 'cliente' && mascota.clienteDni !== req.usuario.dni) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a esta mascota'
                });
            }

            res.json({
                success: true,
                data: mascota
            });
        } catch (error) {
            console.error('Error al buscar mascota:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar mascota',
                error: error.message
            });
        }
    }

    // GET /api/mascotas/cliente/:dni
    static async obtenerMascotasPorClienteDni(req, res) {
        try {
            const { dni } = req.params;
            const token = req.headers.authorization?.split(' ')[1];

            console.log('🔍 Buscando mascotas del cliente:', dni);
            console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');

            // Si es cliente, solo puede ver sus propias mascotas
            if (req.usuario.rol === 'cliente' && dni !== req.usuario.dni) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes ver tus propias mascotas'
                });
            }

            // Verificar que el cliente existe
            const cliente = await ExternosService.verificarCliente(dni, token);
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con DNI: ${dni}`
                });
            }

            const mascotas = await Mascota.find({ 
                clienteDni: dni, 
                activo: true 
            }).sort({ createdAt: -1 });

            res.json({
                success: true,
                cliente: {
                    dni: cliente.dni,
                    nombres: cliente.nombres,
                    apellidos: cliente.apellidos
                },
                mascotas: mascotas,
                count: mascotas.length
            });
        } catch (error) {
            console.error('Error al buscar mascotas del cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar mascotas del cliente',
                error: error.message
            });
        }
    }

    // POST /api/mascotas
    static async crearMascota(req, res) {
        try {
            const { clienteDni } = req.body;
            const token = req.headers.authorization?.split(' ')[1];

            console.log('➕ Creando mascota para cliente:', clienteDni);
            console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');
            console.log('🔑 Primeros 20 caracteres:', token?.substring(0, 20));

            // Verificar que el cliente existe
            const cliente = await ExternosService.verificarCliente(clienteDni, token);
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con DNI: ${clienteDni}`
                });
            }

            // Agregar información del cliente a la mascota
            req.body.clienteInfo = {
                nombres: cliente.nombres,
                apellidos: cliente.apellidos
            };

            const nuevaMascota = new Mascota(req.body);
            await nuevaMascota.save();

            res.status(201).json({
                success: true,
                message: 'Mascota registrada exitosamente',
                data: nuevaMascota
            });
        } catch (error) {
            console.error('❌ Error al crear mascota:', error);
            console.error('❌ Error completo:', error.response?.data || error.message);
            
            // Errores de validación de Mongoose
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al crear mascota',
                error: error.message
            });
        }
    }

    // PUT /api/mascotas/:id
    static async actualizarMascota(req, res) {
        try {
            const { id } = req.params;
            const token = req.headers.authorization?.split(' ')[1];

            console.log('✏️ Actualizando mascota:', id);
            console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');

            // Si se actualiza el clienteDni, verificar que existe
            if (req.body.clienteDni) {
                const cliente = await ExternosService.verificarCliente(req.body.clienteDni, token);
                if (!cliente) {
                    return res.status(404).json({
                        success: false,
                        message: `No se encontró cliente con DNI: ${req.body.clienteDni}`
                    });
                }

                req.body.clienteInfo = {
                    nombres: cliente.nombres,
                    apellidos: cliente.apellidos
                };
            }

            const mascotaActualizada = await Mascota.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!mascotaActualizada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró mascota con ID: ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Mascota actualizada exitosamente',
                data: mascotaActualizada
            });
        } catch (error) {
            console.error('❌ Error al actualizar mascota:', error);
            console.error('❌ Error completo:', error.response?.data || error.message);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar mascota',
                error: error.message
            });
        }
    }

    // DELETE /api/mascotas/:id
    static async eliminarMascota(req, res) {
        try {
            const { id } = req.params;

            const mascota = await Mascota.findByIdAndUpdate(
                id,
                { activo: false },
                { new: true }
            );

            if (!mascota) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró mascota con ID: ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Mascota eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar mascota:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar mascota',
                error: error.message
            });
        }
    }

    // POST /api/mascotas/:id/vacunas
    static async agregarVacuna(req, res) {
        try {
            const { id } = req.params;
            const vacuna = req.body;

            const mascota = await Mascota.findById(id);
            if (!mascota) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró mascota con ID: ${id}`
                });
            }

            mascota.vacunas.push(vacuna);
            await mascota.save();

            res.json({
                success: true,
                message: 'Vacuna agregada exitosamente',
                data: mascota
            });
        } catch (error) {
            console.error('Error al agregar vacuna:', error);
            res.status(500).json({
                success: false,
                message: 'Error al agregar vacuna',
                error: error.message
            });
        }
    }

    // POST /api/mascotas/:id/historial
    static async agregarHistorial(req, res) {
        try {
            const { id } = req.params;
            const entrada = req.body;

            const mascota = await Mascota.findById(id);
            if (!mascota) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró mascota con ID: ${id}`
                });
            }

            mascota.historialMedico.push(entrada);
            await mascota.save();

            res.json({
                success: true,
                message: 'Entrada agregada al historial médico',
                data: mascota
            });
        } catch (error) {
            console.error('Error al agregar historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error al agregar historial',
                error: error.message
            });
        }
    }
}

module.exports = MascotasController;