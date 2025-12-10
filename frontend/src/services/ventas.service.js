import { ventasApi } from './api.service';

class VentasService {
    // Registrar nueva venta
    async registrarVenta(ventaData) {
        const response = await ventasApi.post('/ventas', ventaData); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Obtener todas las ventas
    async getAll(params) {
        const response = await ventasApi.get('/ventas', { params }); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Obtener venta por ID
    async getById(id) {
        const response = await ventasApi.get(`/ventas/${id}`); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Obtener estadísticas generales (solo ventas directas)
    async getEstadisticas(periodo = 'dia') {
        const response = await ventasApi.get('/ventas/estadisticas/generales', { // ⭐ AGREGAR /ventas
            params: { periodo }
        });
        return response.data;
    }

    // Obtener estadísticas combinadas (ventas directas + compras de clientes)
    async getEstadisticasCombinadas(periodo = 'mes') {
        const response = await ventasApi.get('/ventas/estadisticas/combinadas', {
            params: { periodo }
        });
        return response.data;
    }

    // Obtener ventas del día
    async getVentasDelDia() {
        const response = await ventasApi.get('/ventas/dia'); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Obtener top productos
    async getTopProductos(limite = 10) {
        const response = await ventasApi.get('/ventas/top-productos', { // ⭐ AGREGAR /ventas
            params: { limite }
        });
        return response.data;
    }

    // Obtener top productos combinando ventas directas y compras de clientes
    async getTopProductosCombinado(limite = 10) {
        const response = await ventasApi.get('/ventas/top-productos-combinado', {
            params: { limite }
        });
        return response.data;
    }

    // Obtener estadísticas de un producto
    async getEstadisticasProducto(productoId) {
        const response = await ventasApi.get(`/ventas/producto/${productoId}/stats`); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Anular venta
    async anularVenta(id) {
        const response = await ventasApi.delete(`/ventas/${id}`); // ⭐ AGREGAR /ventas
        return response.data;
    }

    // Obtener ventas por día (para gráficos)
    async getVentasPorDia(dias = 30) {
        const response = await ventasApi.get('/ventas/graficos/por-dia', {
            params: { dias }
        });
        return response.data;
    }

    // Obtener ventas por método de pago
    async getVentasPorMetodo(dias = 30) {
        const response = await ventasApi.get('/ventas/graficos/por-metodo', {
            params: { dias }
        });
        return response.data;
    }

    // Obtener ventas por categoría
    async getVentasPorCategoria(dias = 30) {
        const response = await ventasApi.get('/ventas/graficos/por-categoria', {
            params: { dias }
        });
        return response.data;
    }

    // Obtener ventas por hora
    async getVentasPorHora(dias = 7) {
        const response = await ventasApi.get('/ventas/graficos/por-hora', {
            params: { dias }
        });
        return response.data;
    }
}

export default new VentasService();