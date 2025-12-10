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
                    const response = await ventasService.getTopProductosCombinado(1);
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

    const modules = [
        {
            title: 'Clientes',
            description: 'Gestionar información de clientes',
            path: '/clientes',
            image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop',
            color: '#667eea',
            roles: ['admin', 'veterinario', 'enfermera', 'recepcionista']
        },
        {
            title: 'Mascotas',
            description: 'Historial y gestión de mascotas',
            path: '/mascotas',
            image: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=600&h=400&fit=crop',
            color: '#f093fb',
            roles: ['admin', 'veterinario', 'enfermera', 'recepcionista']
        },
        {
            title: 'Productos',
            description: 'Inventario y ventas de productos',
            path: '/productos',
            image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
            color: '#4facfe',
            roles: ['admin', 'veterinario', 'enfermera', 'recepcionista']
        },
        {
            title: 'Citas',
            description: 'Programación de consultas veterinarias',
            path: '/citas',
            image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=400&fit=crop',
            color: '#43e97b',
            roles: ['admin', 'veterinario', 'enfermera', 'recepcionista']
        },
        {
            title: 'Ventas',
            description: 'Registrar y consultar ventas',
            path: '/ventas',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
            color: '#feca57',
            roles: ['admin', 'recepcionista', 'enfermera']
        },
        {
            title: 'Trabajadores',
            description: 'Gestión del equipo médico',
            path: '/trabajadores',
            image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=600&h=400&fit=crop',
            color: '#fa709a',
            roles: ['admin']
        }
    ];

    const visibleModules = modules.filter(module =>
        module.roles.includes(user?.rol)
    );

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="logo">
                        <span className="logo-icon">🏥</span>
                        <div className="logo-text">
                            <h2>Veterinaria Michi</h2>
                            <span className="logo-tagline">Cuidando a tus mascotas</span>
                        </div>
                    </div>
                </div>
                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.nombre} {user?.apellido}
                        </span>
                        <span className="user-role">{user?.rol}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">¡Bienvenido, {user?.nombre}!</h1>
                    <p className="hero-subtitle">
                        Sistema de gestión veterinaria - Panel de {user?.rol}
                    </p>
                </div>
            </div>

            <div className="dashboard-content">
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

                <div className="section-header">
                    <h2>Módulos del Sistema</h2>
                    <p>Selecciona un módulo para comenzar a trabajar</p>
                </div>

                <div className="modules-grid">
                    {visibleModules.map((module, index) => (
                        <div
                            key={index}
                            className="module-card"
                            onClick={() => navigate(module.path)}
                            style={{ '--card-color': module.color }}
                        >
                            <div className="module-image">
                                <img src={module.image} alt={module.title} />
                                <div className="module-overlay"></div>
                            </div>
                            <div className="module-content">
                                <h3>{module.title}</h3>
                                <p>{module.description}</p>
                                <button className="module-button">
                                    Acceder
                                    <span className="arrow">→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
