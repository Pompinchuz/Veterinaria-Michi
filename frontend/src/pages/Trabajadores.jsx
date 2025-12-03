import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TrabajadoresService from '../services/trabajadores.service';
import Modal from '../components/Modal';
import './Trabajadores.css';

function Trabajadores() {
    const [trabajadores, setTrabajadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [cargoFiltro, setCargoFiltro] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false);
    const [isAddHorarioModalOpen, setIsAddHorarioModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedTrabajador, setSelectedTrabajador] = useState(null);
    const [horarios, setHorarios] = useState([]);
    
    // Form states
    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidos: '',
        cargo: 'veterinario',
        especialidad: '',
        telefono: '',
        email: '',
        direccion: '',
        fecha_ingreso: '',
        salario: ''
    });

    const [horarioData, setHorarioData] = useState({
        dia_semana: 'lunes',
        hora_inicio: '',
        hora_fin: ''
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadTrabajadores();
    }, [cargoFiltro]);

    const loadTrabajadores = async () => {
        try {
            setLoading(true);
            const params = {};
            if (cargoFiltro) params.cargo = cargoFiltro;
            
            const response = await TrabajadoresService.getAll(params);
            setTrabajadores(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar trabajadores');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadHorarios = async (trabajadorId) => {
        try {
            const response = await TrabajadoresService.getHorarios(trabajadorId);
            setHorarios(response.horarios || []);
        } catch (err) {
            console.error('Error al cargar horarios:', err);
            setHorarios([]);
        }
    };

    const handleOpenModal = (mode, trabajador = null) => {
        setModalMode(mode);
        if (mode === 'edit' && trabajador) {
            setSelectedTrabajador(trabajador);
            setFormData({
                dni: trabajador.dni,
                nombres: trabajador.nombres,
                apellidos: trabajador.apellidos,
                cargo: trabajador.cargo,
                especialidad: trabajador.especialidad || '',
                telefono: trabajador.telefono || '',
                email: trabajador.email || '',
                direccion: trabajador.direccion || '',
                fecha_ingreso: trabajador.fecha_ingreso ? trabajador.fecha_ingreso.split('T')[0] : '',
                salario: trabajador.salario || ''
            });
        } else {
            setSelectedTrabajador(null);
            setFormData({
                dni: '',
                nombres: '',
                apellidos: '',
                cargo: 'veterinario',
                especialidad: '',
                telefono: '',
                email: '',
                direccion: '',
                fecha_ingreso: '',
                salario: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenHorariosModal = async (trabajador) => {
        setSelectedTrabajador(trabajador);
        await loadHorarios(trabajador.id);
        setIsHorariosModalOpen(true);
    };

    const handleOpenAddHorarioModal = (trabajador) => {
        setSelectedTrabajador(trabajador);
        setHorarioData({
            dia_semana: 'lunes',
            hora_inicio: '',
            hora_fin: ''
        });
        setIsAddHorarioModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsHorariosModalOpen(false);
        setIsAddHorarioModalOpen(false);
        setSelectedTrabajador(null);
        setHorarios([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHorarioChange = (e) => {
        const { name, value } = e.target;
        setHorarioData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const dataToSend = {
                ...formData,
                salario: formData.salario ? Number(formData.salario) : null
            };

            if (modalMode === 'create') {
                await TrabajadoresService.create(dataToSend);
            } else {
                await TrabajadoresService.update(selectedTrabajador.id, dataToSend);
            }
            
            await loadTrabajadores();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar trabajador');
        }
    };

    const handleHorarioSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await TrabajadoresService.agregarHorario(selectedTrabajador.id, horarioData);
            await loadHorarios(selectedTrabajador.id);
            setHorarioData({
                dia_semana: 'lunes',
                hora_inicio: '',
                hora_fin: ''
            });
            setIsAddHorarioModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al agregar horario');
        }
    };

    const handleEliminarHorario = async (horarioId) => {
        if (!window.confirm('¿Estás seguro de eliminar este horario?')) {
            return;
        }

        try {
            await TrabajadoresService.eliminarHorario(selectedTrabajador.id, horarioId);
            await loadHorarios(selectedTrabajador.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar horario');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este trabajador?')) {
            return;
        }

        try {
            await TrabajadoresService.delete(id);
            await loadTrabajadores();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar trabajador');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getCargoEmoji = (cargo) => {
        const emojis = {
            veterinario: '👨‍⚕️',
            enfermera: '👩‍⚕️',
            administrativo: '👔',
            recepcionista: '📋'
        };
        return emojis[cargo] || '👤';
    };

    const getCargoColor = (cargo) => {
        const colors = {
            veterinario: '#2196F3',
            enfermera: '#9C27B0',
            administrativo: '#FF9800',
            recepcionista: '#4CAF50'
        };
        return colors[cargo] || '#666';
    };

    const getDiaNombre = (dia) => {
        const dias = {
            lunes: 'Lunes',
            martes: 'Martes',
            miercoles: 'Miércoles',
            jueves: 'Jueves',
            viernes: 'Viernes',
            sabado: 'Sábado',
            domingo: 'Domingo'
        };
        return dias[dia] || dia;
    };

    const filteredTrabajadores = trabajadores.filter(trabajador => 
        trabajador.dni.includes(searchTerm) ||
        trabajador.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trabajador.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trabajador.email && trabajador.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        <h1>👨‍⚕️ Gestión de Personal</h1>
                        <p>Administra el personal de la veterinaria</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal('create')}>
                        + Nuevo Trabajador
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="filters-bar">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por DNI, nombre, apellido o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    
                    <select 
                        value={cargoFiltro} 
                        onChange={(e) => setCargoFiltro(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los cargos</option>
                        <option value="veterinario">👨‍⚕️ Veterinario</option>
                        <option value="enfermera">👩‍⚕️ Enfermera</option>
                        <option value="administrativo">👔 Administrativo</option>
                        <option value="recepcionista">📋 Recepcionista</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Cargando personal...</div>
                ) : (
                    <div className="trabajadores-grid">
                        {filteredTrabajadores.length === 0 ? (
                            <div className="no-data">
                                No se encontraron trabajadores
                            </div>
                        ) : (
                            filteredTrabajadores.map(trabajador => (
                                <div key={trabajador.id} className="trabajador-card">
                                    <div className="trabajador-header">
                                        <span className="trabajador-emoji">
                                            {getCargoEmoji(trabajador.cargo)}
                                        </span>
                                        <div className="trabajador-info">
                                            <h3>{trabajador.nombres} {trabajador.apellidos}</h3>
                                            <span 
                                                className="cargo-badge" 
                                                style={{ backgroundColor: getCargoColor(trabajador.cargo) }}
                                            >
                                                {trabajador.cargo}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="trabajador-details">
                                        <div className="detail-item">
                                            <span className="detail-label">DNI:</span>
                                            <span>{trabajador.dni}</span>
                                        </div>
                                        {trabajador.especialidad && (
                                            <div className="detail-item">
                                                <span className="detail-label">Especialidad:</span>
                                                <span>{trabajador.especialidad}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="detail-label">Teléfono:</span>
                                            <span>{trabajador.telefono || '-'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span>{trabajador.email || '-'}</span>
                                        </div>
                                        {trabajador.fecha_ingreso && (
                                            <div className="detail-item">
                                                <span className="detail-label">Fecha de ingreso:</span>
                                                <span>{new Date(trabajador.fecha_ingreso).toLocaleDateString('es-PE')}</span>
                                            </div>
                                        )}
                                        <div className="detail-item">
                                            <span className="detail-label">Estado:</span>
                                            <span className={trabajador.activo ? 'estado-activo' : 'estado-inactivo'}>
                                                {trabajador.activo ? '✅ Activo' : '❌ Inactivo'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="trabajador-actions">
                                        <button
                                            className="btn-horarios"
                                            onClick={() => handleOpenHorariosModal(trabajador)}
                                        >
                                            🕐 Horarios
                                        </button>
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleOpenModal('edit', trabajador)}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(trabajador.id)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Crear/Editar Trabajador */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'create' ? 'Nuevo Trabajador' : 'Editar Trabajador'}
            >
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dni">DNI *</label>
                            <input
                                type="text"
                                id="dni"
                                name="dni"
                                value={formData.dni}
                                onChange={handleInputChange}
                                required
                                maxLength="8"
                                disabled={modalMode === 'edit'}
                                placeholder="12345678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cargo">Cargo *</label>
                            <select
                                id="cargo"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="veterinario">Veterinario</option>
                                <option value="enfermera">Enfermera</option>
                                <option value="administrativo">Administrativo</option>
                                <option value="recepcionista">Recepcionista</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombres">Nombres *</label>
                            <input
                                type="text"
                                id="nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                                required
                                placeholder="Juan Carlos"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="apellidos">Apellidos *</label>
                            <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleInputChange}
                                required
                                placeholder="Pérez López"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="especialidad">Especialidad</label>
                        <input
                            type="text"
                            id="especialidad"
                            name="especialidad"
                            value={formData.especialidad}
                            onChange={handleInputChange}
                            placeholder="Medicina General, Cirugía, etc."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="987654321"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="trabajador@vetclinic.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <textarea
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            rows="2"
                            placeholder="Av. Principal 123"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                            <input
                                type="date"
                                id="fecha_ingreso"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="salario">Salario (S/)</label>
                            <input
                                type="number"
                                id="salario"
                                name="salario"
                                value={formData.salario}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                placeholder="3000.00"
                            />
                        </div>
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

            {/* Modal de Horarios */}
            <Modal
                isOpen={isHorariosModalOpen}
                onClose={handleCloseModal}
                title={`Horarios - ${selectedTrabajador?.nombres} ${selectedTrabajador?.apellidos}`}
            >
                <div className="horarios-container">
                    <button 
                        className="btn-primary"
                        onClick={() => {
                            setIsHorariosModalOpen(false);
                            handleOpenAddHorarioModal(selectedTrabajador);
                        }}
                    >
                        + Agregar Horario
                    </button>

                    {horarios.length === 0 ? (
                        <p className="no-horarios">No hay horarios registrados</p>
                    ) : (
                        <div className="horarios-list">
                            {horarios.map(horario => (
                                <div key={horario.id} className="horario-item">
                                    <div className="horario-info">
                                        <strong>{getDiaNombre(horario.dia_semana)}</strong>
                                        <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                                    </div>
                                    <button
                                        className="btn-delete-small"
                                        onClick={() => handleEliminarHorario(horario.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            {/* Modal de Agregar Horario */}
            <Modal
                isOpen={isAddHorarioModalOpen}
                onClose={handleCloseModal}
                title="Agregar Horario"
            >
                <form onSubmit={handleHorarioSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="dia_semana">Día de la semana *</label>
                        <select
                            id="dia_semana"
                            name="dia_semana"
                            value={horarioData.dia_semana}
                            onChange={handleHorarioChange}
                            required
                        >
                            <option value="lunes">Lunes</option>
                            <option value="martes">Martes</option>
                            <option value="miercoles">Miércoles</option>
                            <option value="jueves">Jueves</option>
                            <option value="viernes">Viernes</option>
                            <option value="sabado">Sábado</option>
                            <option value="domingo">Domingo</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="hora_inicio">Hora de inicio *</label>
                            <input
                                type="time"
                                id="hora_inicio"
                                name="hora_inicio"
                                value={horarioData.hora_inicio}
                                onChange={handleHorarioChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="hora_fin">Hora de fin *</label>
                            <input
                                type="time"
                                id="hora_fin"
                                name="hora_fin"
                                value={horarioData.hora_fin}
                                onChange={handleHorarioChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Agregar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Trabajadores;