const axios = require('axios');

const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL;
const MASCOTAS_SERVICE_URL = process.env.MASCOTAS_SERVICE_URL;
const TRABAJADORES_SERVICE_URL = process.env.TRABAJADORES_SERVICE_URL;

class ExternosService {

    // Verificar que el cliente existe
    static async verificarCliente(dni, token) {
        try {
            console.log('🔍 Verificando cliente con DNI:', dni);
            const respuesta = await axios.get(`${CLIENTES_SERVICE_URL}/api/clientes/dni/${dni}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error al verificar cliente:', error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error('Error al comunicarse con el servicio de clientes');
        }
    }

    // Verificar que la mascota existe
    static async verificarMascota(mascotaId, token) {
        try {
            console.log('🔍 Verificando mascota con ID:', mascotaId);
            const respuesta = await axios.get(`${MASCOTAS_SERVICE_URL}/api/mascotas/${mascotaId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error al verificar mascota:', error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error('Error al comunicarse con el servicio de mascotas');
        }
    }

    // Verificar que el veterinario existe
    static async verificarVeterinario(veterinarioId, token) {
        try {
            console.log('🔍 Verificando veterinario con ID:', veterinarioId);
            const respuesta = await axios.get(`${TRABAJADORES_SERVICE_URL}/api/trabajadores/${veterinarioId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const trabajador = respuesta.data.data;

            // Verificar que es veterinario
            if (trabajador.cargo !== 'veterinario') {
                console.error('❌ El trabajador no es veterinario, cargo:', trabajador.cargo);
                return { error: 'El trabajador no es veterinario' };
            }

            return trabajador;
        } catch (error) {
            console.error('❌ Error al verificar veterinario:', error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error('Error al comunicarse con el servicio de trabajadores');
        }
    }

    // Buscar veterinario por email
    static async buscarVeterinarioPorEmail(email, token) {
        try {
            console.log('🔍 Buscando veterinario por email:', email);
            const respuesta = await axios.get(`${TRABAJADORES_SERVICE_URL}/api/trabajadores/email/${email}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const trabajador = respuesta.data.data;

            // Verificar que es veterinario
            if (trabajador && trabajador.cargo !== 'veterinario') {
                console.error('❌ El trabajador no es veterinario, cargo:', trabajador.cargo);
                return null;
            }

            return trabajador;
        } catch (error) {
            console.error('❌ Error al buscar veterinario por email:', error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error('Error al comunicarse con el servicio de trabajadores');
        }
    }

    // Verificar que la mascota pertenece al cliente
    static async verificarMascotaCliente(mascotaId, clienteDni, token) {
        try {
            const mascota = await this.verificarMascota(mascotaId, token);
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

    // Obtener horarios del veterinario
    static async obtenerHorariosVeterinario(veterinarioId, token) {
        try {
            const respuesta = await axios.get(`${TRABAJADORES_SERVICE_URL}/api/trabajadores/${veterinarioId}/horarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return respuesta.data.horarios;
        } catch (error) {
            console.error('❌ Error al obtener horarios:', error.response?.data || error.message);
            return [];
        }
    }

    // Obtener información completa para una cita
    static async obtenerInformacionCompletaCita(clienteDni, mascotaId, veterinarioId, token) {
        try {
            const [cliente, mascota, veterinario] = await Promise.all([
                this.verificarCliente(clienteDni, token),
                this.verificarMascota(mascotaId, token),
                this.verificarVeterinario(veterinarioId, token)
            ]);

            return { cliente, mascota, veterinario };
        } catch (error) {
            console.error('❌ Error al obtener información completa:', error.message);
            throw error;
        }
    }
}

module.exports = ExternosService;