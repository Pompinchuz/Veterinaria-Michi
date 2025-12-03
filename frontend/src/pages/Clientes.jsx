import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClientesService from '../services/clientes.service';
import Modal from '../components/Modal';
import './Clientes.css';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
    const [selectedCliente, setSelectedCliente] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: ''
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            setLoading(true);
            const response = await ClientesService.getAll();
            setClientes(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar clientes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, cliente = null) => {
        setModalMode(mode);
        if (mode === 'edit' && cliente) {
            setSelectedCliente(cliente);
            setFormData({
                dni: cliente.dni,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                telefono: cliente.telefono || '',
                email: cliente.email || '',
                direccion: cliente.direccion || ''
            });
        } else {
            setSelectedCliente(null);
            setFormData({
                dni: '',
                nombres: '',
                apellidos: '',
                telefono: '',
                email: '',
                direccion: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
        setFormData({
            dni: '',
            nombres: '',
            apellidos: '',
            telefono: '',
            email: '',
            direccion: ''
        });
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
            if (modalMode === 'create') {
                await ClientesService.create(formData);
            } else {
                await ClientesService.update(selectedCliente.id, formData);
            }
            
            await loadClientes();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar cliente');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
            return;
        }

        try {
            await ClientesService.delete(id);
            await loadClientes();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar cliente');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredClientes = clientes.filter(cliente => 
        cliente.dni.includes(searchTerm) ||
        cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
                        <h1>👥 Gestión de Clientes</h1>
                        <p>Administra la información de los clientes</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleOpenModal('create')}>
                        + Nuevo Cliente
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por DNI, nombre, apellido o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading">Cargando clientes...</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>DNI</th>
                                    <th>Nombres</th>
                                    <th>Apellidos</th>
                                    <th>Teléfono</th>
                                    <th>Email</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClientes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            No se encontraron clientes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClientes.map(cliente => (
                                        <tr key={cliente.id}>
                                            <td>{cliente.dni}</td>
                                            <td>{cliente.nombres}</td>
                                            <td>{cliente.apellidos}</td>
                                            <td>{cliente.telefono || '-'}</td>
                                            <td>{cliente.email || '-'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleOpenModal('edit', cliente)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    {user?.rol === 'admin' && (
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDelete(cliente.id)}
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

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
            >
                <form onSubmit={handleSubmit} className="form">
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
                            placeholder="cliente@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <textarea
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Av. Principal 123"
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

export default Clientes;