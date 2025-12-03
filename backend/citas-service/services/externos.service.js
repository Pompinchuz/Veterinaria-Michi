const axios = require('axios');

const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL;
const MASCOTAS_SERVICE_URL = process.env.MASCOTAS_SERVICE_URL;
const TRABAJADORES_SERVICE_URL = process.env.TRABAJADORES_SERVICE_URL;

class ExternosService {

    // Verificar que el cliente existe
    static async verificarCliente(dni) {
        try {
            const respuesta = await axios.get(`${CLIENTES_SERVICE_URL}/api/clientes/dni/${dni}`);
            return respuesta.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error('Error al verificar cliente:', error.message);
            throw new Error('Error al comunicarse con el servicio de clientes');
        }
    }

    // Verificar que la mascota existe
    static async verificarMascota(mascotaId) {
        try {
            const respuesta = await axios.get(`${MASCOTAS_SERVICE_URL}/api/mascotas/${mascotaId}`);
            return respuesta.data.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error('Error al verificar mascota:', error.message);
            throw new Error('Error al comunicarse con el servicio de mascotas');
        }
    }

    // Verificar que el veterinario existe
    static async verificarVeterinario(veterinarioId) {
        try {
            const respuesta = await axios.get(`${TRABAJADORES_SERVICE_URL}/api/trabajadores/${veterinarioId}`);
            const trabajador = respuesta.data.data;
            
            // Verificar que sea veterinario
            if (trabajador.cargo !== 'veterinario') {
                return { error: 'El trabajador no es veterinario' };
            }
            
            return trabajador;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error('Error al verificar veterinario:', error.message);
            throw new Error('Error al comunicarse con el servicio de trabajadores');
        }
    }

    // Obtener horarios del veterinario
    static async obtenerHorariosVeterinario(veterinarioId) {
        try {
            const respuesta = await axios.get(`${TRABAJADORES_SERVICE_URL}/api/trabajadores/${veterinarioId}/horarios`);
            return respuesta.data.horarios;
        } catch (error) {
            console.error('Error al obtener horarios:', error.message);
            return [];
        }
    }

    // Verificar que la mascota pertenece al cliente
    static async verificarMascotaCliente(mascotaId, clienteDni) {
        try {
            const mascota = await this.verificarMascota(mascotaId);
            if (!mascota) {
                return { valido: false, mensaje: 'Mascota no encontrada' };
            }
            
            if (mascota.clienteDni !== clienteDni) {
                return { 
                    valido: false, 
                    mensaje: 'La mascota no pertenece al cliente especificado' 
                };
            }
            
            return { valido: true, mascota };
        } catch (error) {
            throw error;
        }
    }

    // Obtener información completa para una cita
    static async obtenerInformacionCompletaCita(clienteDni, mascotaId, veterinarioId) {
        try {
            const [cliente, mascota, veterinario] = await Promise.all([
                this.verificarCliente(clienteDni),
                this.verificarMascota(mascotaId),
                this.verificarVeterinario(veterinarioId)
            ]);

            return {
                cliente,
                mascota,
                veterinario
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ExternosService;