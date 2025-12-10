import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ventasService from '../services/ventas.service';
import './Dashboard.css';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [topProducto, setTopProducto] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const cargarEstadisticas = async () => {
            if (user?.rol === 'admin') {
                try {
                    setLoading(true);
                    const response = await ventasService.getTopProductos(1);
                    if (response.data && response.data.length > 0) {
                        setTopProducto(response.data[0]);
                    }
                } catch (error) {
                    console.error('Error al cargar estadísticas:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        cargarEstadisticas();
    }, [user]);

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

                {user?.rol === 'admin' && (
                    <div className="statistics-section">
                        <h2 className="statistics-title">Producto Más Vendido</h2>
                        {loading ? (
                            <div className="statistics-loading">Cargando estadísticas...</div>
                        ) : topProducto ? (
                            <div className="top-product-card">
                                <div className="product-header">
                                    <div className="product-icon">🏆</div>
                                    <div className="product-info">
                                        <h3>{topProducto.producto_nombre}</h3>
                                        {topProducto.producto_categoria && (
                                            <span className="product-category">{topProducto.producto_categoria}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="product-stats">
                                    <div className="stat-item">
                                        <div className="stat-icon">📦</div>
                                        <div className="stat-details">
                                            <span className="stat-label">Total Vendido</span>
                                            <span className="stat-value">{topProducto.total_vendido} unidades</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon">🔄</div>
                                        <div className="stat-details">
                                            <span className="stat-label">Veces Vendido</span>
                                            <span className="stat-value">{topProducto.veces_vendido} ventas</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon">💰</div>
                                        <div className="stat-details">
                                            <span className="stat-label">Ingresos Generados</span>
                                            <span className="stat-value">S/ {parseFloat(topProducto.ingresos_generados).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-icon">💵</div>
                                        <div className="stat-details">
                                            <span className="stat-label">Precio Promedio</span>
                                            <span className="stat-value">S/ {parseFloat(topProducto.precio_promedio).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-statistics">
                                <p>No hay datos de ventas disponibles aún.</p>
                            </div>
                        )}
                    </div>
                )}

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