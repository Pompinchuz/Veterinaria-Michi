import axios from 'axios';

const API_URL = import.meta.env.VITE_API_AUTH_URL;

class AuthService {
    async login(email, password) {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success) {
            localStorage.setItem('user', JSON.stringify(response.data.data.usuario));
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        
        return response.data;
    }

    async register(userData) {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    }

    // ⭐ NUEVO: Crear usuario desde admin
    async crearUsuarioTrabajador(userData, token) {
        const response = await axios.post(`${API_URL}/auth/register`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem('accessToken');
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();