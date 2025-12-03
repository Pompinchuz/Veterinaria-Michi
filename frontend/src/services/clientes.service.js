import { clientesApi } from './api.service';

class ClientesService {
    async getAll() {
        const response = await clientesApi.get('/clientes');
        return response.data;
    }

    async getByDni(dni) {
        const response = await clientesApi.get(`/clientes/dni/${dni}`);
        return response.data;
    }

    async getById(id) {
        const response = await clientesApi.get(`/clientes/${id}`);
        return response.data;
    }

    // ⭐ NUEVO: Obtener mi propio perfil
    async getMiPerfil() {
        const response = await clientesApi.get('/clientes/mi-perfil');
        return response.data;
    }

    async create(clienteData) {
        const response = await clientesApi.post('/clientes', clienteData);
        return response.data;
    }

    async update(id, clienteData) {
        const response = await clientesApi.put(`/clientes/${id}`, clienteData);
        return response.data;
    }

    async delete(id) {
        const response = await clientesApi.delete(`/clientes/${id}`);
        return response.data;
    }
}

export default new ClientesService();