import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CitasService from '../services/citas.service';
import ClientesService from '../services/clientes.service';
import MascotasService from '../services/mascotas.service';
import Modal from '../components/Modal';
import './Citas.css';

function Citas() {
    const [citas, setCitas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCita, setSelectedCita] = useState(null);
    const [citaDetalle, setCitaDetalle] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        cliente_dni: '',
        mascota_id: '',
        veterinario_id: '',
        fecha: '',
        hora: '',
        motivo: '',
        observaciones: ''
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [estadoFiltro]);

    const loadData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (estadoFiltro) params.estado = estadoFiltro;
            
            const [citasResponse, clientesResponse] = await Promise.all([
                CitasService.getAll(params),
                ClientesService.getAll()
            ]);
            
            setCitas(citasResponse.data);
            setClientes(clientesResponse.data);
            setError('');
        } catch (err) {
            setError('Error al cargar datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMascotasPorCliente = async (clienteDni) => {
        try {
            const response = await MascotasService.getByClienteDni(clienteDni);
            setMascotas(response.mascotas || []);
        } catch (err) {
            console.error('Error al cargar mascotas:', err);
            setMascotas([]);
        }
    };

    const handleOpenModal = (mode, cita = null) => {
        setModalMode(mode);
        if (mode === 'edit' && cita) {
            setSelectedCita(cita);
            setFormData({
                cliente_dni: cita.cliente_dni,
                mascota_id: cita.mascota_id,
                veterinario_id: cita.veterinario_id,
                fecha: cita.fecha.split('T')[0],
                hora: cita.hora,
                motivo: cita.motivo,
                observaciones: cita.observaciones || ''
            });
            loadMascotasPorCliente(cita.cliente_dni);
        } else {
            setSelectedCita(null);
            setFormData({
                cliente_dni: '',
                mascota_id: '',
                veterinario_id: '',
                fecha: '',
                hora: '',
                motivo: '',
                observaciones: ''
            });
            setMascotas([]);
        }
        setIsModalOpen(true);
    };

    const handleOpenDetalle = async (cita) => {
        try {
            const response = await CitasService.getById(cita.id, true);
            setCitaDetalle(response.data);
            setIsDetalleModalOpen(true);
        } catch (err) {
            setError('Error al cargar detalles de la cita');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsDetalleModalOpen(false);
        setSelectedCita(null);
        setCitaDetalle(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Si cambia el cliente, cargar sus mascotas
        if (name === 'cliente_dni' && value) {
            loadMascotasPorCliente(value);
            setFormData(prev => ({ ...prev, mascota_id: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (modalMode === 'create') {
                await CitasService.create(formData);
            } else {
                await CitasService.update(selectedCita.id, formData);
            }
            
            await loadData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar cita');
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        try {
            await CitasService.cambiarEstado(id, nuevoEstado);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cambiar estado');
        }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm('¿Estás seguro de cancelar esta cita?')) {
            return;
        }

        try {
            await CitasService.cancelar(id);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cancelar cita');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getClienteNombre = (dni) => {
        const cliente = clientes.find(c => c.dni === dni);
        return cliente ? `${cliente.nombres} ${cliente.apellidos}` : dni;
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
        const date = new Date(fecha);
        return date.toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const canEdit = user?.rol === 'admin' || user?.rol === 'veterinario';
    const canCancel = user?.rol === 'admin';

    return (
        <div className="page-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h2>🏥 Veterinaria</h2>
                </div>
                <div className="navbar-user">
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        ← Volver
                    </button>
                    <span className="user-name">{user?.nombre} {user?.apellido}</span>
                    <span className="user-role">{user?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="page-content">
                <div className="page-header">
                    <div>
                        <h1>📅 Gestión de Citas</h1>
                        <p>Administra las citas veterinarias</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal('create')}>
                        + Nueva Cita
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="filters-bar">
                    <select 
                        value={estadoFiltro} 
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="confirmada">✅ Confirmada</option>
                        <option value="en_curso">🏥 En Curso</option>
                        <option value="completada">✔️ Completada</option>
                        <option value="cancelada">❌ Cancelada</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Cargando citas...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cliente</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {citas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            No se encontraron citas
                                        </td>
                                    </tr>
                                ) : (
                                    citas.map(cita => (
                                        <tr key={cita.id}>
                                            <td>{formatFecha(cita.fecha)}</td>
                                            <td>{cita.hora}</td>
                                            <td>{getClienteNombre(cita.cliente_dni)}</td>
                                            <td>{cita.motivo}</td>
                                            <td>{getEstadoBadge(cita.estado)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-view"
                                                        onClick={() => handleOpenDetalle(cita)}
                                                        title="Ver detalles"
                                                    >
                                                        👁️
                                                    </button>
                                                    
                                                    {cita.estado === 'pendiente' && (
                                                        <button
                                                            className="btn-confirm"
                                                            onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                                                            title="Confirmar"
                                                        >
                                                            ✅
                                                        </button>
                                                    )}
                                                    
                                                    {cita.estado === 'confirmada' && canEdit && (
                                                        <button
                                                            className="btn-start"
                                                            onClick={() => handleCambiarEstado(cita.id, 'en_curso')}
                                                            title="Iniciar atención"
                                                        >
                                                            ▶️
                                                        </button>
                                                    )}
                                                    
                                                    {cita.estado === 'en_curso' && canEdit && (
                                                        <button
                                                            className="btn-complete"
                                                            onClick={() => handleCambiarEstado(cita.id, 'completada')}
                                                            title="Completar"
                                                        >
                                                            ✔️
                                                        </button>
                                                    )}
                                                    
                                                    {canEdit && cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => handleOpenModal('edit', cita)}
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    
                                                    {canCancel && cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleCancelar(cita.id)}
                                                            title="Cancelar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Crear/Editar Cita */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'create' ? 'Nueva Cita' : 'Editar Cita'}
            >
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="cliente_dni">Cliente *</label>
                        <select
                            id="cliente_dni"
                            name="cliente_dni"
                            value={formData.cliente_dni}
                            onChange={handleInputChange}
                            required
                            disabled={modalMode === 'edit'}
                        >
                            <option value="">Selecciona un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.dni}>
                                    {cliente.dni} - {cliente.nombres} {cliente.apellidos}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="mascota_id">Mascota *</label>
                        <select
                            id="mascota_id"
                            name="mascota_id"
                            value={formData.mascota_id}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.cliente_dni || modalMode === 'edit'}
                        >
                            <option value="">
                                {formData.cliente_dni ? 'Selecciona una mascota' : 'Primero selecciona un cliente'}
                            </option>
                            {mascotas.map(mascota => (
                                <option key={mascota._id} value={mascota._id}>
                                    {mascota.nombre} ({mascota.especie})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="veterinario_id">Veterinario ID *</label>
                        <input
                            type="number"
                            id="veterinario_id"
                            name="veterinario_id"
                            value={formData.veterinario_id}
                            onChange={handleInputChange}
                            required
                            placeholder="ID del veterinario (ej: 1)"
                        />
                        <small>Ingresa el ID del veterinario que atenderá</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha">Fecha *</label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="hora">Hora *</label>
                            <input
                                type="time"
                                id="hora"
                                name="hora"
                                value={formData.hora}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="motivo">Motivo de la cita *</label>
                        <textarea
                            id="motivo"
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleInputChange}
                            required
                            rows="3"
                            placeholder="Describe el motivo de la consulta..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            rows="2"
                            placeholder="Observaciones adicionales..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {modalMode === 'create' ? 'Crear' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Detalle de Cita */}
            <Modal
                isOpen={isDetalleModalOpen}
                onClose={handleCloseModal}
                title="Detalles de la Cita"
            >
                {citaDetalle && (
                    <div className="detalle-cita">
                        <div className="detalle-section">
                            <h3>📅 Información de la Cita</h3>
                            <p><strong>Fecha:</strong> {formatFecha(citaDetalle.fecha)}</p>
                            <p><strong>Hora:</strong> {citaDetalle.hora}</p>
                            <p><strong>Estado:</strong> {getEstadoBadge(citaDetalle.estado)}</p>
                            <p><strong>Motivo:</strong> {citaDetalle.motivo}</p>
                            {citaDetalle.observaciones && (
                                <p><strong>Observaciones:</strong> {citaDetalle.observaciones}</p>
                            )}
                        </div>

                        {citaDetalle.cliente && (
                            <div className="detalle-section">
                                <h3>👤 Cliente</h3>
                                <p><strong>Nombre:</strong> {citaDetalle.cliente.nombres} {citaDetalle.cliente.apellidos}</p>
                                <p><strong>DNI:</strong> {citaDetalle.cliente.dni}</p>
                                <p><strong>Teléfono:</strong> {citaDetalle.cliente.telefono || 'No registrado'}</p>
                                <p><strong>Email:</strong> {citaDetalle.cliente.email || 'No registrado'}</p>
                            </div>
                        )}

                        {citaDetalle.mascota && (
                            <div className="detalle-section">
                                <h3>🐾 Mascota</h3>
                                <p><strong>Nombre:</strong> {citaDetalle.mascota.nombre}</p>
                                <p><strong>Especie:</strong> {citaDetalle.mascota.especie}</p>
                                <p><strong>Raza:</strong> {citaDetalle.mascota.raza || 'No especificada'}</p>
                                <p><strong>Edad:</strong> {citaDetalle.mascota.edad || 0} años</p>
                                <p><strong>Peso:</strong> {citaDetalle.mascota.peso || 0} kg</p>
                            </div>
                        )}

                        {citaDetalle.veterinario && (
                            <div className="detalle-section">
                                <h3>👨‍⚕️ Veterinario</h3>
                                <p><strong>Nombre:</strong> {citaDetalle.veterinario.nombres} {citaDetalle.veterinario.apellidos}</p>
                                <p><strong>Especialidad:</strong> {citaDetalle.veterinario.especialidad || 'General'}</p>
                            </div>
                        )}

                        {citaDetalle.diagnostico && (
                            <div className="detalle-section">
                                <h3>🔍 Diagnóstico</h3>
                                <p>{citaDetalle.diagnostico}</p>
                            </div>
                        )}

                        {citaDetalle.tratamiento && (
                            <div className="detalle-section">
                                <h3>💊 Tratamiento</h3>
                                <p>{citaDetalle.tratamiento}</p>
                            </div>
                        )}

                        {citaDetalle.costo && (
                            <div className="detalle-section">
                                <h3>💰 Costo</h3>
                                <p className="precio">S/ {citaDetalle.costo.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Citas;