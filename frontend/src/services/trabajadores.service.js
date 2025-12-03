import { trabajadoresApi } from './api.service';

class TrabajadoresService {
    async getAll(params) {
        const response = await trabajadoresApi.get('/trabajadores', { params });
        return response.data;
    }

    async getByDni(dni) {
        const response = await trabajadoresApi.get(`/trabajadores/dni/${dni}`);
        return response.data;
    }

    async getById(id, incluirHorarios = false) {
        const response = await trabajadoresApi.get(`/trabajadores/${id}`, {
            params: { incluirHorarios }
        });
        return response.data;
    }

    async getHorarios(id) {
        const response = await trabajadoresApi.get(`/trabajadores/${id}/horarios`);
        return response.data;
    }

    async create(trabajadorData) {
        const response = await trabajadoresApi.post('/trabajadores', trabajadorData);
        return response.data;
    }

    async update(id, trabajadorData) {
        const response = await trabajadoresApi.put(`/trabajadores/${id}`, trabajadorData);
        return response.data;
    }

    async delete(id) {
        const response = await trabajadoresApi.delete(`/trabajadores/${id}`);
        return response.data;
    }

    async agregarHorario(id, horarioData) {
        const response = await trabajadoresApi.post(`/trabajadores/${id}/horarios`, horarioData);
        return response.data;
    }

    async eliminarHorario(trabajadorId, horarioId) {
        const response = await trabajadoresApi.delete(`/trabajadores/${trabajadorId}/horarios/${horarioId}`);
        return response.data;
    }
}

export default new TrabajadoresService();