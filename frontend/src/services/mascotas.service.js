import { mascotasApi } from './api.service';

class MascotasService {
    async getAll() {
        const response = await mascotasApi.get('/mascotas');
        return response.data;
    }

    async getById(id) {
        const response = await mascotasApi.get(`/mascotas/${id}`);
        return response.data;
    }

    async getByClienteDni(dni) {
        const response = await mascotasApi.get(`/mascotas/cliente/${dni}`);
        return response.data;
    }

    async create(mascotaData) {
        const response = await mascotasApi.post('/mascotas', mascotaData);
        return response.data;
    }

    async update(id, mascotaData) {
        const response = await mascotasApi.put(`/mascotas/${id}`, mascotaData);
        return response.data;
    }

    async delete(id) {
        const response = await mascotasApi.delete(`/mascotas/${id}`);
        return response.data;
    }

    async agregarVacuna(id, vacunaData) {
        const response = await mascotasApi.post(`/mascotas/${id}/vacunas`, vacunaData);
        return response.data;
    }

    async agregarHistorial(id, historialData) {
        const response = await mascotasApi.post(`/mascotas/${id}/historial`, historialData);
        return response.data;
    }
}

export default new MascotasService();