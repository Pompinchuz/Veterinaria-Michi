const axios = require('axios');

const PRODUCTOS_SERVICE_URL = process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:3003';
const CLIENTES_SERVICE_URL = process.env.CLIENTES_SERVICE_URL || 'http://localhost:3001';
const TRABAJADORES_SERVICE_URL = process.env.TRABAJADORES_SERVICE_URL || 'http://localhost:3004';

class ExternosService {

    // Obtener información del producto
    static async obtenerProducto(productoId, token) {
        try {
            console.log('🔍 Obteniendo producto:', productoId);
            
            const respuesta = await axios.get(
                `${PRODUCTOS_SERVICE_URL}/api/productos/${productoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error al obtener producto:', error.response?.data || error.message);
            throw new Error('Error al comunicarse con el servicio de productos');
        }
    }

    // Reducir stock del producto
    static async reducirStock(productoId, cantidad, token) {
        try {
            console.log('📦 Reduciendo stock del producto:', productoId, 'cantidad:', cantidad);
            
            const respuesta = await axios.patch(
                `${PRODUCTOS_SERVICE_URL}/api/productos/${productoId}/stock`,
                {
                    cantidad: cantidad,
                    operacion: 'restar'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error al reducir stock:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Error al actualizar stock del producto');
        }
    }

    // Aumentar stock del producto (en caso de anular venta)
    static async aumentarStock(productoId, cantidad, token) {
        try {
            console.log('📦 Aumentando stock del producto:', productoId, 'cantidad:', cantidad);
            
            const respuesta = await axios.patch(
                `${PRODUCTOS_SERVICE_URL}/api/productos/${productoId}/stock`,
                {
                    cantidad: cantidad,
                    operacion: 'sumar'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.error('❌ Error al aumentar stock:', error.response?.data || error.message);
            throw new Error('Error al restaurar stock del producto');
        }
    }

    // Verificar si existe un cliente por DNI
    static async verificarCliente(dni, token) {
        try {
            const respuesta = await axios.get(
                `${CLIENTES_SERVICE_URL}/api/clientes/dni/${dni}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.log('⚠️ Cliente no encontrado por DNI:', dni);
            return null;
        }
    }

    // ⭐ NUEVO: Verificar cliente por email (para órdenes)
    static async verificarClientePorEmail(email, token) {
        try {
            const respuesta = await axios.get(
                `${CLIENTES_SERVICE_URL}/api/clientes/mi-perfil`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.log('⚠️ Cliente no encontrado por email:', email);
            return null;
        }
    }

    // Obtener información del trabajador
    static async obtenerTrabajador(trabajadorId, token) {
        try {
            const respuesta = await axios.get(
                `${TRABAJADORES_SERVICE_URL}/api/trabajadores/${trabajadorId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return respuesta.data.data;
        } catch (error) {
            console.log('⚠️ Trabajador no encontrado:', trabajadorId);
            return null;
        }
    }
}

module.exports = ExternosService;