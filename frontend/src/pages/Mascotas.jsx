import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MascotasService from '../services/mascotas.service';
import ClientesService from '../services/clientes.service';
import Modal from '../components/Modal';
import './Mascotas.css';

function Mascotas() {
    const [mascotas, setMascotas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedMascota, setSelectedMascota] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        especie: 'perro',
        raza: '',
        edad: '',
        peso: '',
        sexo: 'macho',
        color: '',
        clienteDni: '',
        observaciones: ''
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mascotasResponse, clientesResponse] = await Promise.all([
                MascotasService.getAll(),
                ClientesService.getAll()
            ]);
            setMascotas(mascotasResponse.data);
            setClientes(clientesResponse.data);
            setError('');
        } catch (err) {
            setError('Error al cargar datos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, mascota = null) => {
        setModalMode(mode);
        if (mode === 'edit' && mascota) {
            setSelectedMascota(mascota);
            setFormData({
                nombre: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza || '',
                edad: mascota.edad || '',
                peso: mascota.peso || '',
                sexo: mascota.sexo || 'macho',
                color: mascota.color || '',
                clienteDni: mascota.clienteDni,
                observaciones: mascota.observaciones || ''
            });
        } else {
            setSelectedMascota(null);
            setFormData({
                nombre: '',
                especie: 'perro',
                raza: '',
                edad: '',
                peso: '',
                sexo: 'macho',
                color: '',
                clienteDni: '',
                observaciones: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMascota(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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
                edad: formData.edad ? Number(formData.edad) : 0,
                peso: formData.peso ? Number(formData.peso) : 0
            };

            if (modalMode === 'create') {
                await MascotasService.create(dataToSend);
            } else {
                await MascotasService.update(selectedMascota._id, dataToSend);
            }
            
            await loadData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar mascota');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta mascota?')) {
            return;
        }

        try {
            await MascotasService.delete(id);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar mascota');
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

    const getEspecieEmoji = (especie) => {
        const emojis = {
            perro: '🐕',
            gato: '🐈',
            ave: '🦜',
            conejo: '🐰',
            hamster: '🐹',
            otro: '🐾'
        };
        return emojis[especie] || '🐾';
    };

    const filteredMascotas = mascotas.filter(mascota => 
        mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mascota.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mascota.clienteDni.includes(searchTerm) ||
        (mascota.raza && mascota.raza.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const canEdit = user?.rol === 'admin' || user?.rol === 'veterinario';

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
                        <h1>🐾 Gestión de Mascotas</h1>
                        <p>Administra la información de las mascotas</p>
                    </div>
                    {canEdit && (
                        <button className="btn-primary" onClick={() => handleOpenModal('create')}>
                            + Nueva Mascota
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, especie, raza o DNI del dueño..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading">Cargando mascotas...</div>
                ) : (
                    <div className="mascotas-grid">
                        {filteredMascotas.length === 0 ? (
                            <div className="no-data">
                                No se encontraron mascotas
                            </div>
                        ) : (
                            filteredMascotas.map(mascota => (
                                <div key={mascota._id} className="mascota-card">
                                    <div className="mascota-header">
                                        <span className="mascota-emoji">
                                            {getEspecieEmoji(mascota.especie)}
                                        </span>
                                        <div className="mascota-info">
                                            <h3>{mascota.nombre}</h3>
                                            <p className="mascota-especie">{mascota.especie}</p>
                                        </div>
                                    </div>

                                    <div className="mascota-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Raza:</span>
                                            <span>{mascota.raza || 'No especificada'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Edad:</span>
                                            <span>{mascota.edad || 0} años</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Peso:</span>
                                            <span>{mascota.peso || 0} kg</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Sexo:</span>
                                            <span>{mascota.sexo}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Dueño:</span>
                                            <span>{getClienteNombre(mascota.clienteDni)}</span>
                                        </div>
                                        {mascota.vacunas && mascota.vacunas.length > 0 && (
                                            <div className="detail-item">
                                                <span className="detail-label">Vacunas:</span>
                                                <span>{mascota.vacunas.length}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mascota-actions">
                                        {canEdit && (
                                            <>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleOpenModal('edit', mascota)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                {user?.rol === 'admin' && (
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(mascota._id)}
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'create' ? 'Nueva Mascota' : 'Editar Mascota'}
            >
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                                placeholder="Firulais"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="especie">Especie *</label>
                            <select
                                id="especie"
                                name="especie"
                                value={formData.especie}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="perro">Perro</option>
                                <option value="gato">Gato</option>
                                <option value="ave">Ave</option>
                                <option value="conejo">Conejo</option>
                                <option value="hamster">Hamster</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="raza">Raza</label>
                            <input
                                type="text"
                                id="raza"
                                name="raza"
                                value={formData.raza}
                                onChange={handleInputChange}
                                placeholder="Labrador"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sexo">Sexo *</label>
                            <select
                                id="sexo"
                                name="sexo"
                                value={formData.sexo}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="macho">Macho</option>
                                <option value="hembra">Hembra</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edad">Edad (años)</label>
                            <input
                                type="number"
                                id="edad"
                                name="edad"
                                value={formData.edad}
                                onChange={handleInputChange}
                                min="0"
                                step="1"
                                placeholder="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="peso">Peso (kg)</label>
                            <input
                                type="number"
                                id="peso"
                                name="peso"
                                value={formData.peso}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                placeholder="25.5"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="color">Color</label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            placeholder="Dorado"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clienteDni">Dueño (DNI) *</label>
                        <select
                            id="clienteDni"
                            name="clienteDni"
                            value={formData.clienteDni}
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
                        <label htmlFor="observaciones">Observaciones</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Mascota muy activa y juguetona"
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
        </div>
    );
}

export default Mascotas;