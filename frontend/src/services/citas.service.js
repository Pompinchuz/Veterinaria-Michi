import { citasApi } from './api.service';

class CitasService {
    async getAll(params) {
        const response = await citasApi.get('/citas', { params });
        return response.data;
    }

    async getById(id, incluirDetalles = false) {
        const response = await citasApi.get(`/citas/${id}`, {
            params: { incluirDetalles }
        });
        return response.data;
    }

    async getEstadisticas() {
        const response = await citasApi.get('/citas/estadisticas/resumen');
        return response.data;
    }

    async create(citaData) {
        const response = await citasApi.post('/citas', citaData);
        return response.data;
    }

    async update(id, citaData) {
        const response = await citasApi.put(`/citas/${id}`, citaData);
        return response.data;
    }

    async cambiarEstado(id, estado) {
        const response = await citasApi.patch(`/citas/${id}/estado`, { estado });
        return response.data;
    }

    async cancelar(id) {
        const response = await citasApi.delete(`/citas/${id}`);
        return response.data;
    }
}

export default new CitasService();