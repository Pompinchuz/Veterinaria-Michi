//src/pages/PortalCliente.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MascotasService from '../services/mascotas.service';
import CitasService from '../services/citas.service';
import ProductosService from '../services/productos.service';
import ClientesService from '../services/clientes.service';
import './PortalCliente.css';

function PortalCliente() {
    const [cliente, setCliente] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [citas, setCitas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mascotas');

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // ⭐ CAMBIO: Obtener mi propio perfil
            const clienteResponse = await ClientesService.getMiPerfil();
            const clienteEncontrado = clienteResponse.data;
            
            if (clienteEncontrado) {
                setCliente(clienteEncontrado);

                // Cargar mascotas del cliente
                try {
                    const mascotasResponse = await MascotasService.getByClienteDni(clienteEncontrado.dni);
                    setMascotas(mascotasResponse.mascotas || []);
                } catch (err) {
                    console.log('No se pudieron cargar mascotas:', err);
                    setMascotas([]);
                }

                // Cargar citas del cliente
                try {
                    const citasResponse = await CitasService.getAll({ clienteDni: clienteEncontrado.dni });
                    setCitas(citasResponse.data || []);
                } catch (err) {
                    console.log('No se pudieron cargar citas:', err);
                    setCitas([]);
                }
            }

            // Cargar productos disponibles
            try {
                const productosResponse = await ProductosService.getAll();
                setProductos(productosResponse.data || []);
            } catch (err) {
                console.log('No se pudieron cargar productos:', err);
                setProductos([]);
            }

        } catch (err) {
            console.error('Error al cargar datos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { color: '#FF9800', emoji: '⏳', texto: 'Pendiente' },
            confirmada: { color: '#2196F3', emoji: '✅', texto: 'Confirmada' },
            en_curso: { color: '#9C27B0', emoji: '🏥', texto: 'En Curso' },
            completada: { color: '#4CAF50', emoji: '✔️', texto: 'Completada' },
            cancelada: { color: '#F44336', emoji: '❌', texto: 'Cancelada' }
        };
        const badge = badges[estado] || badges.pendiente;
        return (
            <span className="estado-badge" style={{ backgroundColor: badge.color }}>
                {badge.emoji} {badge.texto}
            </span>
        );
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading-portal">Cargando tu información...</div>;
    }

    return (
        <div className="portal-container">
            <nav className="portal-navbar">
                <div className="navbar-brand">
                    <h2>🐾 Mi Portal</h2>
                </div>
                <div className="navbar-user">
                    <span className="welcome-text">
                        Hola, <strong>{user?.nombre}</strong>
                    </span>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="portal-content">
                <div className="portal-header">
                    <h1>Bienvenido a tu Portal 🏥</h1>
                    {cliente ? (
                        <div className="cliente-info-box">
                            <p><strong>DNI:</strong> {cliente.dni}</p>
                            <p><strong>Email:</strong> {cliente.email}</p>
                            <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            <p>⚠️ No se encontró tu perfil de cliente.</p>
                            <p>Por favor, contacta con la clínica para completar tu registro.</p>
                        </div>
                    )}
                </div>

                <div className="portal-tabs">
                    <button
                        className={`tab ${activeTab === 'mascotas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('mascotas')}
                    >
                        🐾 Mis Mascotas ({mascotas.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'citas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('citas')}
                    >
                        📅 Mis Citas ({citas.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'productos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('productos')}
                    >
                        🛒 Productos ({productos.length})
                    </button>
                </div>

                <div className="portal-tab-content">
                    {/* Tab de Mascotas */}
                    {activeTab === 'mascotas' && (
                        <div className="mascotas-list">
                            {mascotas.length === 0 ? (
                                <div className="empty-state">
                                    <p>😿 Aún no tienes mascotas registradas</p>
                                    <small>Visita nuestra clínica para registrar a tu mascota</small>
                                </div>
                            ) : (
                                <div className="cards-grid">
                                    {mascotas.map(mascota => (
                                        <div key={mascota._id} className="mascota-card-portal">
                                            <div className="mascota-header-portal">
                                                <h3>{mascota.nombre}</h3>
                                                <span className="mascota-especie">{mascota.especie}</span>
                                            </div>
                                            <div className="mascota-details-portal">
                                                <p><strong>Raza:</strong> {mascota.raza || 'No especificada'}</p>
                                                <p><strong>Edad:</strong> {mascota.edad || 0} años</p>
                                                <p><strong>Peso:</strong> {mascota.peso || 0} kg</p>
                                                {mascota.vacunas && mascota.vacunas.length > 0 && (
                                                    <p><strong>Vacunas:</strong> {mascota.vacunas.length} registradas</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab de Citas */}
                    {activeTab === 'citas' && (
                        <div className="citas-list">
                            {citas.length === 0 ? (
                                <div className="empty-state">
                                    <p>📅 No tienes citas programadas</p>
                                    <small>Comunícate con nosotros para agendar una cita</small>
                                </div>
                            ) : (
                                <div className="citas-table">
                                    {citas.map(cita => (
                                        <div key={cita.id} className="cita-card-portal">
                                            <div className="cita-fecha">
                                                <span className="fecha">{formatFecha(cita.fecha)}</span>
                                                <span className="hora">{cita.hora}</span>
                                            </div>
                                            <div className="cita-info">
                                                <p><strong>Motivo:</strong> {cita.motivo}</p>
                                                <p><strong>Estado:</strong> {getEstadoBadge(cita.estado)}</p>
                                                {cita.observaciones && (
                                                    <p><strong>Observaciones:</strong> {cita.observaciones}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab de Productos */}
                    {activeTab === 'productos' && (
                        <div className="productos-list">
                            <p className="productos-info">
                                🛒 Productos disponibles en nuestra veterinaria
                            </p>
                            <div className="cards-grid">
                                {productos.map(producto => (
                                    <div key={producto._id} className="producto-card-portal">
                                        <h3>{producto.nombre}</h3>
                                        <span className="producto-categoria">{producto.categoria}</span>
                                        <p className="producto-precio">S/ {producto.precio.toFixed(2)}</p>
                                        {producto.descripcion && (
                                            <p className="producto-desc">{producto.descripcion}</p>
                                        )}
                                        {producto.stock > 0 ? (
                                            <span className="stock-badge disponible">✅ Disponible</span>
                                        ) : (
                                            <span className="stock-badge agotado">❌ Agotado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PortalCliente;