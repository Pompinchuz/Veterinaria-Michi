import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VentasService from '../services/ventas.service';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Estadisticas.css';

function Estadisticas() {
    const [periodo, setPeriodo] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [ventasPorDia, setVentasPorDia] = useState([]);
    const [ventasPorMetodo, setVentasPorMetodo] = useState([]);
    const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
    const [ventasPorHora, setVentasPorHora] = useState([]);
    const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
    const [topProductos, setTopProductos] = useState([]);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarDatos();
    }, [periodo]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');

            const [
                ventasDia,
                ventasMetodo,
                ventasCategoria,
                ventasHora,
                estadisticas,
                productos
            ] = await Promise.all([
                VentasService.getVentasPorDia(periodo),
                VentasService.getVentasPorMetodo(periodo),
                VentasService.getVentasPorCategoria(periodo),
                VentasService.getVentasPorHora(7),
                VentasService.getEstadisticasCombinadas(periodo >= 30 ? 'mes' : 'semana'),
                VentasService.getTopProductosCombinado(5)
            ]);

            setVentasPorDia(ventasDia.data || []);
            setVentasPorMetodo(ventasMetodo.data || []);
            setVentasPorCategoria(ventasCategoria.data || []);
            setVentasPorHora(ventasHora.data || []);
            setEstadisticasGenerales(estadisticas.data?.resumen || null);
            setTopProductos(productos.data || []);

        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    };

    const formatCurrency = (value) => {
        return `S/ ${parseFloat(value || 0).toFixed(2)}`;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const getCategoriaEmoji = (categoria) => {
        const emojis = {
            alimento: '🍖',
            juguete: '🎾',
            medicina: '💊',
            accesorio: '🎀',
            higiene: '🧼',
            otro: '📦'
        };
        return emojis[categoria] || '📦';
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h2>🏥 Veterinaria - Estadísticas</h2>
                </div>
                <div className="navbar-user">
                    <button onClick={() => navigate('/ventas')} className="btn-back">
                        ← Volver a Ventas
                    </button>
                    <span className="user-name">{user?.nombre} {user?.apellido}</span>
                    <span className="user-role">{user?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="estadisticas-container">
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* Selector de Período */}
                <div className="periodo-selector">
                    <label>Período de análisis:</label>
                    <div className="periodo-buttons">
                        <button
                            className={periodo === 7 ? 'active' : ''}
                            onClick={() => setPeriodo(7)}
                        >
                            7 días
                        </button>
                        <button
                            className={periodo === 30 ? 'active' : ''}
                            onClick={() => setPeriodo(30)}
                        >
                            30 días
                        </button>
                        <button
                            className={periodo === 90 ? 'active' : ''}
                            onClick={() => setPeriodo(90)}
                        >
                            90 días
                        </button>
                    </div>
                </div>

                {/* Tarjetas de Resumen */}
                {estadisticasGenerales && (
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-icon">🛒</div>
                            <div className="stat-content">
                                <h3>Total Ventas</h3>
                                <p className="stat-value">{estadisticasGenerales.total_ventas || 0}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>Ingresos Totales</h3>
                                <p className="stat-value">{formatCurrency(estadisticasGenerales.ingresos_totales)}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📦</div>
                            <div className="stat-content">
                                <h3>Productos Vendidos</h3>
                                <p className="stat-value">{estadisticasGenerales.total_productos_vendidos || 0}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <h3>Ticket Promedio</h3>
                                <p className="stat-value">{formatCurrency(estadisticasGenerales.ticket_promedio)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico de Ventas por Día */}
                <div className="chart-section">
                    <h3>📈 Ventas por Día</h3>
                    <div className="chart-container">
                        {ventasPorDia.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={ventasPorDia}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="fecha"
                                        tickFormatter={formatFecha}
                                    />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip
                                        labelFormatter={formatFecha}
                                        formatter={(value, name) => {
                                            if (name === 'Ingresos') return formatCurrency(value);
                                            return value;
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="total_ventas"
                                        stroke="#8884d8"
                                        name="Ventas"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="ingresos"
                                        stroke="#82ca9d"
                                        name="Ingresos"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="no-data">No hay datos de ventas para mostrar</p>
                        )}
                    </div>
                    {ventasPorDia.length > 0 && (
                        <div className="chart-insights">
                            <p><strong>Día con más ventas:</strong> {
                                ventasPorDia.reduce((max, dia) =>
                                    parseFloat(dia.ingresos) > parseFloat(max.ingresos) ? dia : max
                                ).fecha
                            } con {formatCurrency(
                                ventasPorDia.reduce((max, dia) =>
                                    parseFloat(dia.ingresos) > parseFloat(max.ingresos) ? dia : max
                                ).ingresos
                            )}</p>
                            <p><strong>Día con menos ventas:</strong> {
                                ventasPorDia.reduce((min, dia) =>
                                    parseFloat(dia.ingresos) < parseFloat(min.ingresos) ? dia : min
                                ).fecha
                            } con {formatCurrency(
                                ventasPorDia.reduce((min, dia) =>
                                    parseFloat(dia.ingresos) < parseFloat(min.ingresos) ? dia : min
                                ).ingresos
                            )}</p>
                        </div>
                    )}
                </div>

                {/* Gráficos en Grid */}
                <div className="charts-grid">
                    {/* Gráfico de Ventas por Método de Pago */}
                    <div className="chart-section">
                        <h3>💳 Ventas por Método de Pago</h3>
                        <div className="chart-container">
                            {ventasPorMetodo.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={ventasPorMetodo}
                                            dataKey="total_ingresos"
                                            nameKey="metodo_pago"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label={(entry) => `${entry.metodo_pago}: ${formatCurrency(entry.total_ingresos)}`}
                                        >
                                            {ventasPorMetodo.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="no-data">No hay datos para mostrar</p>
                            )}
                        </div>
                    </div>

                    {/* Gráfico de Ventas por Categoría */}
                    <div className="chart-section">
                        <h3>📦 Ventas por Categoría</h3>
                        <div className="chart-container">
                            {ventasPorCategoria.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ventasPorCategoria}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="categoria" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="ingresos" fill="#8884d8" name="Ingresos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="no-data">No hay datos para mostrar</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gráfico de Ventas por Hora */}
                <div className="chart-section">
                    <h3>🕐 Ventas por Hora del Día (últimos 7 días)</h3>
                    <div className="chart-container">
                        {ventasPorHora.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ventasPorHora}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="hora"
                                        tickFormatter={(hora) => `${hora}:00`}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(hora) => `${hora}:00`}
                                        formatter={(value, name) => {
                                            if (name === 'Ingresos') return formatCurrency(value);
                                            return value;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="total_ventas" fill="#82ca9d" name="Ventas" />
                                    <Bar dataKey="ingresos" fill="#8884d8" name="Ingresos" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="no-data">No hay datos para mostrar</p>
                        )}
                    </div>
                </div>

                {/* Top Productos */}
                <div className="chart-section">
                    <h3>🏆 Top 5 Productos Más Vendidos</h3>
                    <div className="top-productos-list">
                        {topProductos.length > 0 ? (
                            topProductos.map((producto, index) => (
                                <div key={index} className="producto-item">
                                    <div className="producto-rank">#{index + 1}</div>
                                    <div className="producto-emoji">
                                        {getCategoriaEmoji(producto.producto_categoria)}
                                    </div>
                                    <div className="producto-info">
                                        <strong>{producto.producto_nombre}</strong>
                                        <p>
                                            Vendido: {producto.total_vendido} unidades |
                                            Ingresos: {formatCurrency(producto.ingresos_generados)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay productos para mostrar</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Estadisticas;
