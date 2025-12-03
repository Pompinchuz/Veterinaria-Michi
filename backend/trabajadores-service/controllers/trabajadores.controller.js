const TrabajadorModel = require('../models/trabajador.model');

class TrabajadoresController {

    // GET /api/trabajadores
    static async obtenerTodosTrabajadores(req, res) {
        try {
            const { cargo } = req.query;

            let trabajadores;
            if (cargo) {
                trabajadores = await TrabajadorModel.obtenerPorCargo(cargo);
            } else {
                trabajadores = await TrabajadorModel.obtenerTodos();
            }

            res.json({
                success: true,
                data: trabajadores,
                count: trabajadores.length
            });
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener trabajadores',
                error: error.message
            });
        }
    }

    // GET /api/trabajadores/dni/:dni
    static async obtenerTrabajadorPorDni(req, res) {
        try {
            const { dni } = req.params;
            const trabajador = await TrabajadorModel.obtenerPorDni(dni);

            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con DNI: ${dni}`
                });
            }

            res.json({
                success: true,
                data: trabajador
            });
        } catch (error) {
            console.error('Error al buscar trabajador por DNI:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar trabajador',
                error: error.message
            });
        }
    }

    // GET /api/trabajadores/:id
    static async obtenerTrabajadorPorId(req, res) {
        try {
            const { id } = req.params;
            const { incluirHorarios } = req.query;

            let trabajador;
            if (incluirHorarios === 'true') {
                trabajador = await TrabajadorModel.obtenerConHorarios(id);
            } else {
                trabajador = await TrabajadorModel.obtenerPorId(id);
            }

            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con ID: ${id}`
                });
            }

            res.json({
                success: true,
                data: trabajador
            });
        } catch (error) {
            console.error('Error al buscar trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar trabajador',
                error: error.message
            });
        }
    }

    // POST /api/trabajadores
    static async crearTrabajador(req, res) {
        try {
            const { dni, nombres, apellidos, cargo, email } = req.body;

            // Validaciones básicas
            if (!dni || !nombres || !apellidos || !cargo) {
                return res.status(400).json({
                    success: false,
                    message: 'DNI, nombres, apellidos y cargo son obligatorios'
                });
            }

            // Verificar si el DNI ya existe
            const trabajadorExistenteDni = await TrabajadorModel.obtenerPorDni(dni);
            if (trabajadorExistenteDni) {
                return res.status(409).json({
                    success: false,
                    message: `Ya existe un trabajador con DNI: ${dni}`
                });
            }

            // Verificar si el email ya existe (si se proporciona)
            if (email) {
                const trabajadorExistenteEmail = await TrabajadorModel.obtenerPorEmail(email);
                if (trabajadorExistenteEmail) {
                    return res.status(409).json({
                        success: false,
                        message: `Ya existe un trabajador con email: ${email}`
                    });
                }
            }

            const trabajadorId = await TrabajadorModel.crear(req.body);
            const nuevoTrabajador = await TrabajadorModel.obtenerPorId(trabajadorId);

            res.status(201).json({
                success: true,
                message: 'Trabajador creado exitosamente',
                data: nuevoTrabajador
            });
        } catch (error) {
            console.error('Error al crear trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear trabajador',
                error: error.message
            });
        }
    }

    // PUT /api/trabajadores/:id
    static async actualizarTrabajador(req, res) {
        try {
            const { id } = req.params;
            const { email } = req.body;

            // Verificar si el trabajador existe
            const trabajadorExistente = await TrabajadorModel.obtenerPorId(id);
            if (!trabajadorExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con ID: ${id}`
                });
            }

            // Si se actualiza el email, verificar que no exista
            if (email && email !== trabajadorExistente.email) {
                const trabajadorConEmail = await TrabajadorModel.obtenerPorEmail(email);
                if (trabajadorConEmail) {
                    return res.status(409).json({
                        success: false,
                        message: `Ya existe un trabajador con email: ${email}`
                    });
                }
            }

            const affectedRows = await TrabajadorModel.actualizar(id, req.body);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el trabajador'
                });
            }

            const trabajadorActualizado = await TrabajadorModel.obtenerPorId(id);

            res.json({
                success: true,
                message: 'Trabajador actualizado exitosamente',
                data: trabajadorActualizado
            });
        } catch (error) {
            console.error('Error al actualizar trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar trabajador',
                error: error.message
            });
        }
    }

    // DELETE /api/trabajadores/:id
    static async eliminarTrabajador(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el trabajador existe
            const trabajadorExistente = await TrabajadorModel.obtenerPorId(id);
            if (!trabajadorExistente) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con ID: ${id}`
                });
            }

            const affectedRows = await TrabajadorModel.eliminar(id);

            if (affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el trabajador'
                });
            }

            res.json({
                success: true,
                message: 'Trabajador eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar trabajador',
                error: error.message
            });
        }
    }

    // GET /api/trabajadores/:id/horarios
    static async obtenerHorariosTrabajador(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el trabajador existe
            const trabajador = await TrabajadorModel.obtenerPorId(id);
            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con ID: ${id}`
                });
            }

            const horarios = await TrabajadorModel.obtenerHorarios(id);

            res.json({
                success: true,
                trabajador: {
                    id: trabajador.id,
                    nombres: trabajador.nombres,
                    apellidos: trabajador.apellidos,
                    cargo: trabajador.cargo
                },
                horarios: horarios,
                count: horarios.length
            });
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener horarios',
                error: error.message
            });
        }
    }

    // POST /api/trabajadores/:id/horarios
    static async agregarHorario(req, res) {
        try {
            const { id } = req.params;
            const { dia_semana, hora_inicio, hora_fin } = req.body;

            // Validaciones
            if (!dia_semana || !hora_inicio || !hora_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Día, hora de inicio y hora de fin son obligatorios'
                });
            }

            // Verificar que el trabajador existe
            const trabajador = await TrabajadorModel.obtenerPorId(id);
            if (!trabajador) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró trabajador con ID: ${id}`
                });
            }

            const horarioData = {
                trabajador_id: id,
                dia_semana,
                hora_inicio,
                hora_fin
            };

            const horarioId = await TrabajadorModel.agregarHorario(horarioData);

            res.status(201).json({
                success: true,
                message: 'Horario agregado exitosamente',
                horarioId: horarioId
            });
        } catch (error) {
            console.error('Error al agregar horario:', error);
            
            // Error de horario duplicado
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un horario para este trabajador en ese día'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al agregar horario',
                error: error.message
            });
        }
    }

    // DELETE /api/trabajadores/:id/horarios/:horarioId
    static async eliminarHorario(req, res) {
        try {
            const { horarioId } = req.params;

            const affectedRows = await TrabajadorModel.eliminarHorario(horarioId);

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró el horario especificado'
                });
            }

            res.json({
                success: true,
                message: 'Horario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar horario',
                error: error.message
            });
        }
    }
}

module.exports = TrabajadoresController;