const axios = require('axios');

const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL;
const tokenInterno = require("./TokenInterno");
class ExternosService {

    // Verificar que el cliente existe
    static async verificarCliente(dni, token) {
        try {
            console.log('🔍 Verificando cliente con DNI:', dni);
            console.log('🔑 Token recibido:', token ? 'SÍ (presente)' : 'NO (ausente)');
            console.log('🔑 Primeros 20 caracteres del token:', token?.substring(0, 20));
            
            const respuesta = await axios.get(`${CLIENTES_SERVICE_URL}/api/clientes/dni/${dni}`, {
                headers: {
                    'Authorization': `Bearer ${tokenInterno}`
                }
            });
            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error en verificarCliente:', error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw new Error('Error al comunicarse con el servicio de clientes');
        }
    }
}

module.exports = ExternosService;