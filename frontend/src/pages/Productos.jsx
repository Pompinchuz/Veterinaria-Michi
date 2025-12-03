import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductosService from '../services/productos.service';
import Modal from '../components/Modal';
import './Productos.css';

function Productos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [stockBajo, setStockBajo] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedProducto, setSelectedProducto] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        categoria: 'alimento',
        subcategoria: '',
        descripcion: '',
        precio: '',
        stock: '',
        stockMinimo: '',
        unidadMedida: '',
        marca: '',
        proveedor: '',
        codigoBarras: ''
    });

    const [stockData, setStockData] = useState({
        cantidad: '',
        operacion: 'sumar'
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadProductos();
    }, [categoriaFiltro, stockBajo]);

    const loadProductos = async () => {
        try {
            setLoading(true);
            const params = {};
            if (categoriaFiltro) params.categoria = categoriaFiltro;
            if (stockBajo) params.stockBajo = true;
            
            const response = await ProductosService.getAll(params);
            setProductos(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar productos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, producto = null) => {
        setModalMode(mode);
        if (mode === 'edit' && producto) {
            setSelectedProducto(producto);
            setFormData({
                nombre: producto.nombre,
                categoria: producto.categoria,
                subcategoria: producto.subcategoria || '',
                descripcion: producto.descripcion || '',
                precio: producto.precio,
                stock: producto.stock,
                stockMinimo: producto.stockMinimo || '',
                unidadMedida: producto.unidadMedida || '',
                marca: producto.marca || '',
                proveedor: producto.proveedor || '',
                codigoBarras: producto.codigoBarras || ''
            });
        } else {
            setSelectedProducto(null);
            setFormData({
                nombre: '',
                categoria: 'alimento',
                subcategoria: '',
                descripcion: '',
                precio: '',
                stock: '',
                stockMinimo: '',
                unidadMedida: '',
                marca: '',
                proveedor: '',
                codigoBarras: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenStockModal = (producto) => {
        setSelectedProducto(producto);
        setStockData({ cantidad: '', operacion: 'sumar' });
        setIsStockModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsStockModalOpen(false);
        setSelectedProducto(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setStockData(prev => ({
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
                precio: Number(formData.precio),
                stock: Number(formData.stock),
                stockMinimo: formData.stockMinimo ? Number(formData.stockMinimo) : 0
            };

            if (modalMode === 'create') {
                await ProductosService.create(dataToSend);
            } else {
                await ProductosService.update(selectedProducto._id, dataToSend);
            }
            
            await loadProductos();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar producto');
        }
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await ProductosService.updateStock(selectedProducto._id, {
                cantidad: Number(stockData.cantidad),
                operacion: stockData.operacion
            });
            
            await loadProductos();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar stock');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }

        try {
            await ProductosService.delete(id);
            await loadProductos();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar producto');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

    const filteredProductos = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producto.codigoBarras && producto.codigoBarras.includes(searchTerm))
    );

    const isAdmin = user?.rol === 'admin';

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
                        <h1>🛒 Gestión de Productos</h1>
                        <p>Administra el inventario de productos</p>
                    </div>
                    {isAdmin && (
                        <button className="btn-primary" onClick={() => handleOpenModal('create')}>
                            + Nuevo Producto
                        </button>
                    )}
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="filters-bar">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, marca o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    
                    <select 
                        value={categoriaFiltro} 
                        onChange={(e) => setCategoriaFiltro(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todas las categorías</option>
                        <option value="alimento">🍖 Alimento</option>
                        <option value="juguete">🎾 Juguete</option>
                        <option value="medicina">💊 Medicina</option>
                        <option value="accesorio">🎀 Accesorio</option>
                        <option value="higiene">🧼 Higiene</option>
                        <option value="otro">📦 Otro</option>
                    </select>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={stockBajo}
                            onChange={(e) => setStockBajo(e.target.checked)}
                        />
                        <span>Solo stock bajo</span>
                    </label>
                </div>

                {loading ? (
                    <div className="loading">Cargando productos...</div>
                ) : (
                    <div className="productos-grid">
                        {filteredProductos.length === 0 ? (
                            <div className="no-data">
                                No se encontraron productos
                            </div>
                        ) : (
                            filteredProductos.map(producto => (
                                <div key={producto._id} className="producto-card">
                                    <div className="producto-header">
                                        <span className="producto-emoji">
                                            {getCategoriaEmoji(producto.categoria)}
                                        </span>
                                        <div className="producto-info">
                                            <h3>{producto.nombre}</h3>
                                            <p className="producto-categoria">{producto.categoria}</p>
                                        </div>
                                    </div>

                                    <div className="producto-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Precio:</span>
                                            <span className="precio">S/ {producto.precio.toFixed(2)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Stock:</span>
                                            <span className={producto.stock <= (producto.stockMinimo || 0) ? 'stock-bajo' : ''}>
                                                {producto.stock} {producto.unidadMedida}
                                                {producto.stock <= (producto.stockMinimo || 0) && ' ⚠️'}
                                            </span>
                                        </div>
                                        {producto.marca && (
                                            <div className="detail-item">
                                                <span className="detail-label">Marca:</span>
                                                <span>{producto.marca}</span>
                                            </div>
                                        )}
                                        {producto.codigoBarras && (
                                            <div className="detail-item">
                                                <span className="detail-label">Código:</span>
                                                <span>{producto.codigoBarras}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="producto-actions">
                                        {isAdmin && (
                                            <>
                                                <button
                                                    className="btn-stock"
                                                    onClick={() => handleOpenStockModal(producto)}
                                                >
                                                    📦 Stock
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleOpenModal('edit', producto)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(producto._id)}
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Crear/Editar Producto */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
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
                                placeholder="Alimento Premium"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoria">Categoría *</label>
                            <select
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="alimento">Alimento</option>
                                <option value="juguete">Juguete</option>
                                <option value="medicina">Medicina</option>
                                <option value="accesorio">Accesorio</option>
                                <option value="higiene">Higiene</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            rows="2"
                            placeholder="Descripción del producto"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="precio">Precio (S/) *</label>
                            <input
                                type="number"
                                id="precio"
                                name="precio"
                                value={formData.precio}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="99.90"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock *</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                                min="0"
                                placeholder="100"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stockMinimo">Stock Mínimo</label>
                            <input
                                type="number"
                                id="stockMinimo"
                                name="stockMinimo"
                                value={formData.stockMinimo}
                                onChange={handleInputChange}
                                min="0"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="unidadMedida">Unidad de Medida</label>
                            <input
                                type="text"
                                id="unidadMedida"
                                name="unidadMedida"
                                value={formData.unidadMedida}
                                onChange={handleInputChange}
                                placeholder="kg, unidad, litro"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="marca">Marca</label>
                            <input
                                type="text"
                                id="marca"
                                name="marca"
                                value={formData.marca}
                                onChange={handleInputChange}
                                placeholder="Marca del producto"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="proveedor">Proveedor</label>
                            <input
                                type="text"
                                id="proveedor"
                                name="proveedor"
                                value={formData.proveedor}
                                onChange={handleInputChange}
                                placeholder="Nombre del proveedor"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="codigoBarras">Código de Barras</label>
                            <input
                                type="text"
                                id="codigoBarras"
                                name="codigoBarras"
                                value={formData.codigoBarras}
                                onChange={handleInputChange}
                                placeholder="7501234567890"
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

            {/* Modal de Actualizar Stock */}
            <Modal
                isOpen={isStockModalOpen}
                onClose={handleCloseModal}
                title={`Actualizar Stock - ${selectedProducto?.nombre}`}
            >
                <form onSubmit={handleStockSubmit} className="form">
                    <div className="stock-info">
                        <p><strong>Stock actual:</strong> {selectedProducto?.stock} {selectedProducto?.unidadMedida}</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="operacion">Operación</label>
                        <select
                            id="operacion"
                            name="operacion"
                            value={stockData.operacion}
                            onChange={handleStockChange}
                            required
                        >
                            <option value="sumar">➕ Agregar al stock</option>
                            <option value="restar">➖ Restar del stock</option>
                            <option value="asignar">📝 Establecer stock directamente</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cantidad">Cantidad *</label>
                        <input
                            type="number"
                            id="cantidad"
                            name="cantidad"
                            value={stockData.cantidad}
                            onChange={handleStockChange}
                            required
                            min="0"
                            placeholder="0"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Actualizar
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Productos;