const CitaModel = require('../models/cita.model');
const ExternosService = require('../services/externos.service');

class CitasController {

    // GET /api/citas
    // GET /api/citas
static async obtenerTodasCitas(req, res) {
    try {
        const { estado, fecha, clienteDni, mascotaId, veterinarioId } = req.query;

        let citas;

        if (estado) {
            citas = await CitaModel.obtenerPorEstado(estado);
        } else if (fecha) {
            citas = await CitaModel.obtenerPorFecha(fecha);
        } else if (clienteDni) {
            citas = await CitaModel.obtenerPorCliente(clienteDni);
        } else if (mascotaId) {
            citas = await CitaModel.obtenerPorMascota(mascotaId);
        } else if (veterinarioId) {
            citas = await CitaModel.obtenerPorVeterinario(veterinarioId);
        } else {
            // ⭐ Si es cliente, solo ver sus propias citas
            if (req.usuario.rol === 'cliente') {
                // Buscar DNI del cliente por email
                const ClientesService = require('../services/externos.service');
                const token = req.headers.authorization?.split(' ')[1];
                
                try {
                    const cliente = await ClientesService.verificarCliente(req.usuario.email, token);
                    if (cliente) {
                        citas = await CitaModel.obtenerPorCliente(cliente.dni);
                    } else {
                        citas = [];
                    }
                } catch (err) {
                    citas = [];
                }
            } else {
                // Personal puede ver todas
                citas = await CitaModel.obtenerTodas();
            }
        }

        res.json({
            success: true,
            data: citas,
            count: citas.length
        });
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener citas',
            error: error.message
        });
    }
}

    // GET /api/citas/:id
    static async obtenerCitaPorId(req, res) {
        try {
            const { id } = req.params;
            const { incluirDetalles } = req.query;
            const token = req.headers.authorization?.split(' ')[1];

            const cita = await CitaModel.obtenerPorId(id);

            if (!cita) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cita con ID: ${id}`
                });
            }

            // Si se solicitan detalles, obtener información de otros servicios
            if (incluirDetalles === 'true') {
                try {
                    const detalles = await ExternosService.obtenerInformacionCompletaCita(
                        cita.cliente_dni,
                        cita.mascota_id,
                        cita.veterinario_id,
                        token
                    );

                    cita.cliente = detalles.cliente;
                    cita.mascota = detalles.mascota;
                    cita.veterinario = detalles.veterinario;
                } catch (error) {
                    console.error('Error al obtener detalles:', error);
                }
            }

            res.json({
                success: true,
                data: cita
            });
        } catch (error) {
            console.error('Error al buscar cita:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar cita',
                error: error.message
            });
        }
    }

    // POST /api/citas
    static async crearCita(req, res) {
        try {
            const { cliente_dni, mascota_id, veterinario_id, fecha, hora, motivo } = req.body;
            const token = req.headers.authorization?.split(' ')[1];

            console.log('➕ Creando cita para cliente:', cliente_dni);
            console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');

            // Validaciones básicas
            if (!cliente_dni || !mascota_id || !veterinario_id || !fecha || !hora || !motivo) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios: cliente_dni, mascota_id, veterinario_id, fecha, hora, motivo'
                });
            }

            // Verificar que el cliente existe
            const cliente = await ExternosService.verificarCliente(cliente_dni, token);
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con DNI: ${cliente_dni}`
                });
            }

            // Verificar que la mascota existe y pertenece al cliente
            const verificacion = await ExternosService.verificarMascotaCliente(mascota_id, cliente_dni, token);
            if (!verificacion.valido) {
                return res.status(400).json({
                    success: false,
                    message: verificacion.mensaje
                });
            }

            // Verificar que el veterinario existe y es veterinario
            const veterinario = await ExternosService.verificarVeterinario(veterinario_id, token);
            if (!veterinario) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró veterinario con ID: ${veterinario_id}`
                });
            }
            if (veterinario.error) {
                return res.status(400).json({
                    success: false,
                    message: veterinario.error
                });
            }

            // Verificar disponibilidad del veterinario en esa fecha/hora
            const disponible = await CitaModel.verificarDisponibilidad(veterinario_id, fecha, hora);
            if (!disponible) {
                return res.status(409).json({
                    success: false,
                    message: 'El veterinario ya tiene una cita agendada en esa fecha y hora'
                });
            }

            // Crear la cita
            const citaId = await CitaModel.crear(req.body);
            const nuevaCita = await CitaModel.obtenerPorId(citaId);

            res.status(201).json({
                success: true,
                message: 'Cita creada exitosamente',
                data: nuevaCita
            });
        } catch (error) {
            console.error('❌ Error al crear cita:', error);
            console.error('❌ Error completo:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error al crear cita',
                error: error.message
            });
        }
    }

    // PUT /api/citas/:id
    static async actualizarCita(req, res) {
        try {
            const { id } = req.params;
            const { veterinario_id, fecha, hora } = req.body;
            const token = req.headers.authorization?.split(' ')[1];

            console.log('✏️ Actualizando cita:', id);
            console.log('🔑 Token presente:', token ? 'SÍ' : 'NO');

            // Verificar si la cita existe
            const citaExistente = await CitaModel.obtenerPorId(id);
            if (!citaExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cita con ID: ${id}`
                });
            }

            // Si se cambia veterinario, verificar que existe
            if (veterinario_id && veterinario_id !== citaExistente.veterinario_id) {
                const veterinario = await ExternosService.verificarVeterinario(veterinario_id, token);
                if (!veterinario) {
                    return res.status(404).json({
                        success: false,
                        message: `No se encontró veterinario con ID: ${veterinario_id}`
                    });
                }
                if (veterinario.error) {
                    return res.status(400).json({
                        success: false,
                        message: veterinario.error
                    });
                }
            }

            // Si se cambia fecha/hora, verificar disponibilidad
            if ((fecha || hora) && (veterinario_id || citaExistente.veterinario_id)) {
                const vetId = veterinario_id || citaExistente.veterinario_id;
                const nuevaFecha = fecha || citaExistente.fecha;
                const nuevaHora = hora || citaExistente.hora;

                const disponible = await CitaModel.verificarDisponibilidad(vetId, nuevaFecha, nuevaHora, id);
                if (!disponible) {
                    return res.status(409).json({
                        success: false,
                        message: 'El veterinario ya tiene una cita agendada en esa fecha y hora'
                    });
                }
            }

            const affectedRows = await CitaModel.actualizar(id, req.body);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar la cita'
                });
            }

            const citaActualizada = await CitaModel.obtenerPorId(id);

            res.json({
                success: true,
                message: 'Cita actualizada exitosamente',
                data: citaActualizada
            });
        } catch (error) {
            console.error('❌ Error al actualizar cita:', error);
            console.error('❌ Error completo:', error.response?.data || error.message);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar cita',
                error: error.message
            });
        }
    }

    // PATCH /api/citas/:id/estado
    static async cambiarEstadoCita(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const estadosValidos = ['pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada'];
            if (!estado || !estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
                });
            }

            const cita = await CitaModel.obtenerPorId(id);
            if (!cita) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cita con ID: ${id}`
                });
            }

            const affectedRows = await CitaModel.cambiarEstado(id, estado);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo cambiar el estado de la cita'
                });
            }

            const citaActualizada = await CitaModel.obtenerPorId(id);

            res.json({
                success: true,
                message: `Cita marcada como ${estado}`,
                data: citaActualizada
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar estado de la cita',
                error: error.message
            });
        }
    }

    // DELETE /api/citas/:id
    static async cancelarCita(req, res) {
        try {
            const { id } = req.params;

            const cita = await CitaModel.obtenerPorId(id);
            if (!cita) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cita con ID: ${id}`
                });
            }

            const affectedRows = await CitaModel.cancelar(id);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo cancelar la cita'
                });
            }

            res.json({
                success: true,
                message: 'Cita cancelada exitosamente'
            });
        } catch (error) {
            console.error('Error al cancelar cita:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cancelar cita',
                error: error.message
            });
        }
    }

    // GET /api/citas/estadisticas/resumen
    static async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await CitaModel.obtenerEstadisticas();

            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }
}

module.exports = CitasController;