import { ventasApi } from './api.service';

class OrdenesService {
    // Cliente realiza una compra
    async realizarCompra(compraData) {
        const response = await ventasApi.post('/ordenes/comprar', compraData);
        return response.data;
    }

    // Cliente ve su historial de compras
    async getMisCompras() {
        const response = await ventasApi.get('/ordenes/mis-compras');
        return response.data;
    }

    // Obtener detalle de una orden
    async getById(id) {
        const response = await ventasApi.get(`/ordenes/${id}`);
        return response.data;
    }

    // Cliente cancela su orden
    async cancelarOrden(id) {
        const response = await ventasApi.delete(`/ordenes/${id}`);
        return response.data;
    }

    // Personal - Obtener todas las órdenes
    async getAll(params) {
        const response = await ventasApi.get('/ordenes', { params });
        return response.data;
    }

    // Personal - Actualizar estado de orden
    async actualizarEstado(id, estado) {
        const response = await ventasApi.patch(`/ordenes/${id}/estado`, { estado });
        return response.data;
    }

    // Personal - Obtener estadísticas
    async getEstadisticas(periodo = 'dia') {
        const response = await ventasApi.get('/ordenes/estadisticas/generales', {
            params: { periodo }
        });
        return response.data;
    }
}

export default new OrdenesService();