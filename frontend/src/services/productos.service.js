import { productosApi } from './api.service';

class ProductosService {
    async getAll(params) {
        const response = await productosApi.get('/productos', { params });
        return response.data;
    }

    async getById(id) {
        const response = await productosApi.get(`/productos/${id}`);
        return response.data;
    }

    async getByCodigo(codigoBarras) {
        const response = await productosApi.get(`/productos/codigo/${codigoBarras}`);
        return response.data;
    }

    async search(termino) {
        const response = await productosApi.get(`/productos/buscar/${termino}`);
        return response.data;
    }

    async getCategorias() {
        const response = await productosApi.get('/productos/categorias/lista');
        return response.data;
    }

    async create(productoData) {
        const response = await productosApi.post('/productos', productoData);
        return response.data;
    }

    async update(id, productoData) {
        const response = await productosApi.put(`/productos/${id}`, productoData);
        return response.data;
    }

    async updateStock(id, stockData) {
        const response = await productosApi.patch(`/productos/${id}/stock`, stockData);
        return response.data;
    }

    async delete(id) {
        const response = await productosApi.delete(`/productos/${id}`);
        return response.data;
    }
}

export default new ProductosService();