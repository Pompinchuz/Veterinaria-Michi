import axios from 'axios';
import AuthService from './auth.service';

const createApiClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // Interceptor para agregar token a todas las peticiones
    client.interceptors.request.use(
        (config) => {
            const token = AuthService.getToken();
            console.log('🔑 Token enviado:', token ? 'SÍ (presente)' : 'NO (ausente)'); // ← AGREGAR ESTA LÍNEA
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Interceptor para manejar errores de autenticación
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.error('❌ Error 401 - Token inválido o expirado');
                AuthService.logout();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// Crear clientes para cada servicio
export const authApi = createApiClient(import.meta.env.VITE_API_AUTH_URL);
export const clientesApi = createApiClient(import.meta.env.VITE_API_CLIENTES_URL);
export const mascotasApi = createApiClient(import.meta.env.VITE_API_MASCOTAS_URL);
export const productosApi = createApiClient(import.meta.env.VITE_API_PRODUCTOS_URL);
export const trabajadoresApi = createApiClient(import.meta.env.VITE_API_TRABAJADORES_URL);
export const citasApi = createApiClient(import.meta.env.VITE_API_CITAS_URL);
export const ventasApi = createApiClient(import.meta.env.VITE_API_VENTAS_URL); // ⭐ AGREGAR
