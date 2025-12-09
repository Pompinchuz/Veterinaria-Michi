import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h2>🏥 Veterinaria</h2>
                </div>
                <div className="navbar-user">
                    <span className="user-name">
                        {user?.nombre} {user?.apellido}
                    </span>
                    <span className="user-role">{user?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1>¡Bienvenido, {user?.nombre}! 👋</h1>
                    <p>Rol: <strong>{user?.rol}</strong></p>
                </div>

                <div className="modules-grid">
                    <div className="module-card" onClick={() => navigate('/clientes')}>
                        <div className="module-icon">👥</div>
                        <h3>Clientes</h3>
                        <p>Gestionar clientes</p>
                    </div>

                    <div className="module-card" onClick={() => navigate('/mascotas')}>
                        <div className="module-icon">🐾</div>
                        <h3>Mascotas</h3>
                        <p>Gestionar mascotas</p>
                    </div>

                    <div className="module-card" onClick={() => navigate('/productos')}>
                        <div className="module-icon">🛒</div>
                        <h3>Productos</h3>
                        <p>Gestionar productos</p>
                    </div>

                    <div className="module-card" onClick={() => navigate('/citas')}>
                        <div className="module-icon">📅</div>
                        <h3>Citas</h3>
                        <p>Gestionar citas</p>
                    </div>

                    <div className="dashboard-card" onClick={() => navigate('/ventas')}>
                     <div className="card-icon">💰</div>
                    <h3>Ventas</h3>
                    <p>Registrar ventas</p>
                    </div>

                    {user?.rol === 'admin' && (
                        <div className="module-card" onClick={() => navigate('/trabajadores')}>
                            <div className="module-icon">👨‍⚕️</div>
                            <h3>Trabajadores</h3>
                            <p>Gestionar personal</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;