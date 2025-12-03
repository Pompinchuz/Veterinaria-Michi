import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>⛔ Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;