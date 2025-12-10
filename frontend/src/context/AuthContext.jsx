import { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => AuthService.getCurrentUser());
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const response = await AuthService.login(email, password);
        setUser(response.data.usuario);
        return response;
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

     // ⭐ NUEVO: Obtener la ruta por defecto según el rol
    const getDefaultRoute = () => {
        if (!user) return '/login';
        if (user.rol === 'cliente') return '/portal-cliente';
        return '/dashboard';
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        getDefaultRoute
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Exportar el hook por separado para evitar el warning de ESLint
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export default AuthContext;