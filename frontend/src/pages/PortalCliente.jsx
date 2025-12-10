import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import MascotasService from '../services/mascotas.service';
import CitasService from '../services/citas.service';
import ProductosService from '../services/productos.service';
import ClientesService from '../services/clientes.service';
import OrdenesService from '../services/ordenes.service';
import CarritoFlotante from '../components/CarritoFlotante';
import Modal from '../components/Modal';
import ModalFactura from '../components/ModalFactura';
import './PortalCliente.css';

function PortalCliente() {
    const [cliente, setCliente] = useState(null);
    const [mascotas, setMascotas] = useState([]);
    const [citas, setCitas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [misCompras, setMisCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tienda');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    
    // Estados del carrito y checkout
    const [showCarritoModal, setShowCarritoModal] = useState(false);
    const [showDetalleCompra, setShowDetalleCompra] = useState(false);
    const [compraDetalle, setCompraDetalle] = useState(null);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [observaciones, setObservaciones] = useState('');
    const [procesandoCompra, setProcesandoCompra] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

<<<<<<< HEAD
=======
    // Estados para factura
    const [showFacturaModal, setShowFacturaModal] = useState(false);
    const [facturaActual, setFacturaActual] = useState(null);

>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
    const { user, logout } = useAuth();
    const { carrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, calcularTotal, getCantidadTotal } = useCarrito();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'compras') {
            loadMisCompras();
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);

            const clienteResponse = await ClientesService.getMiPerfil();
            const clienteEncontrado = clienteResponse.data;
            
            if (clienteEncontrado) {
                setCliente(clienteEncontrado);

                try {
                    const mascotasResponse = await MascotasService.getByClienteDni(clienteEncontrado.dni);
                    setMascotas(mascotasResponse.mascotas || []);
                } catch (err) {
                    console.log('No se pudieron cargar mascotas:', err);
                    setMascotas([]);
                }

                try {
                    const citasResponse = await CitasService.getAll({ clienteDni: clienteEncontrado.dni });
                    setCitas(citasResponse.data || []);
                } catch (err) {
                    console.log('No se pudieron cargar citas:', err);
                    setCitas([]);
                }
            }

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

    const loadMisCompras = async () => {
        try {
            const response = await OrdenesService.getMisCompras();
            setMisCompras(response.data || []);
        } catch (err) {
            console.error('Error al cargar compras:', err);
        }
    };

    const handleAgregarAlCarrito = (producto) => {
        if (producto.stock <= 0) {
            setError('Producto sin stock disponible');
            setTimeout(() => setError(''), 3000);
            return;
        }

        agregarAlCarrito(producto, 1);
        setSuccess(`✅ ${producto.nombre} agregado al carrito`);
        setTimeout(() => setSuccess(''), 2000);
    };

    const handleFinalizarCompra = async () => {
        if (carrito.length === 0) {
            setError('El carrito está vacío');
            return;
        }

        setError('');
        setProcesandoCompra(true);

        try {
            const productosCompra = carrito.map(item => ({
                producto_id: item._id,
                cantidad: item.cantidadCarrito
            }));

<<<<<<< HEAD
            await OrdenesService.realizarCompra({
=======
            const response = await OrdenesService.realizarCompra({
>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
                productos: productosCompra,
                metodo_pago: metodoPago,
                direccion_entrega: cliente?.direccion || '',
                observaciones: observaciones || null
            });

<<<<<<< HEAD
            setSuccess('🎉 ¡Compra realizada exitosamente!');
=======
            // Limpiar el carrito y cerrar modal
>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
            vaciarCarrito();
            setShowCarritoModal(false);
            setObservaciones('');
            setMetodoPago('efectivo');
<<<<<<< HEAD
            
=======

            // Si la respuesta incluye una factura, mostrar el modal de factura
            if (response.factura) {
                setFacturaActual(response.factura);
                setShowFacturaModal(true);
            } else {
                setSuccess('🎉 ¡Compra realizada exitosamente!');
                setTimeout(() => setSuccess(''), 2000);
            }

>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
            // Recargar productos para actualizar stock
            const productosResponse = await ProductosService.getAll();
            setProductos(productosResponse.data || []);

<<<<<<< HEAD
            setTimeout(() => {
                setSuccess('');
=======
            // Recargar compras
            setTimeout(() => {
>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
                setActiveTab('compras');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar la compra');
        } finally {
            setProcesandoCompra(false);
        }
    };

    const handleVerDetalleCompra = async (compra) => {
        try {
            const response = await OrdenesService.getById(compra.id);
            setCompraDetalle(response.data);
            setShowDetalleCompra(true);
        } catch (err) {
            setError('Error al cargar detalles de la compra');
        }
    };

    const handleCancelarCompra = async (compraId) => {
        if (!window.confirm('¿Estás seguro de cancelar esta compra? Se restaurará el stock.')) {
            return;
        }

        try {
            await OrdenesService.cancelarOrden(compraId);
            setSuccess('✅ Compra cancelada exitosamente');
            loadMisCompras();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cancelar compra');
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

    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { color: '#FF9800', emoji: '⏳', texto: 'Pendiente' },
            confirmada: { color: '#2196F3', emoji: '✅', texto: 'Confirmada' },
            en_curso: { color: '#9C27B0', emoji: '🏥', texto: 'En Curso' },
            completada: { color: '#4CAF50', emoji: '✔️', texto: 'Completada' },
            cancelada: { color: '#F44336', emoji: '❌', texto: 'Cancelada' },
            pagado: { color: '#4CAF50', emoji: '💳', texto: 'Pagado' },
            preparando: { color: '#2196F3', emoji: '📦', texto: 'Preparando' },
            listo: { color: '#9C27B0', emoji: '✅', texto: 'Listo' }
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const productosFiltrados = productos.filter(producto => {
        const matchBusqueda = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro;
        return matchBusqueda && matchCategoria && producto.stock > 0;
    });

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

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="portal-tabs">
                    <button
                        className={`tab ${activeTab === 'tienda' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tienda')}
                    >
                        🛒 Tienda ({productos.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'compras' ? 'active' : ''}`}
                        onClick={() => setActiveTab('compras')}
                    >
                        📦 Mis Compras ({misCompras.length})
                    </button>
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
                </div>

                <div className="portal-tab-content">
                    {/* Tab de Tienda */}
                    {activeTab === 'tienda' && (
                        <div className="tienda-container">
                            <div className="tienda-filtros">
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input-tienda"
                                />
                                <select
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                                    className="categoria-select"
                                >
                                    <option value="">Todas las categorías</option>
                                    <option value="alimento">🍖 Alimento</option>
                                    <option value="juguete">🎾 Juguete</option>
                                    <option value="medicina">💊 Medicina</option>
                                    <option value="accesorio">🎀 Accesorio</option>
                                    <option value="higiene">🧼 Higiene</option>
                                    <option value="otro">📦 Otro</option>
                                </select>
                            </div>

                            <div className="productos-grid-tienda">
                                {productosFiltrados.length === 0 ? (
                                    <div className="empty-state">
                                        <p>No se encontraron productos disponibles</p>
                                    </div>
                                ) : (
                                    productosFiltrados.map(producto => (
                                        <div key={producto._id} className="producto-card-tienda">
                                            <div className="producto-emoji-tienda">
                                                {getCategoriaEmoji(producto.categoria)}
                                            </div>
                                            <h3>{producto.nombre}</h3>
                                            <p className="producto-categoria-tienda">{producto.categoria}</p>
                                            {producto.descripcion && (
                                                <p className="producto-descripcion">{producto.descripcion}</p>
                                            )}
                                            <div className="producto-footer-tienda">
                                                <span className="producto-precio-tienda">
                                                    S/ {producto.precio.toFixed(2)}
                                                </span>
                                                <span className="producto-stock-tienda">
                                                    Stock: {producto.stock}
                                                </span>
                                            </div>
                                            <button
                                                className="btn-agregar-carrito"
                                                onClick={() => handleAgregarAlCarrito(producto)}
                                                disabled={producto.stock === 0}
                                            >
                                                🛒 Agregar
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab de Mis Compras */}
                    {activeTab === 'compras' && (
                        <div className="compras-list">
                            {misCompras.length === 0 ? (
                                <div className="empty-state">
                                    <p>📦 Aún no has realizado compras</p>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setActiveTab('tienda')}
                                    >
                                        Ir a la Tienda
                                    </button>
                                </div>
                            ) : (
                                <div className="compras-grid">
                                    {misCompras.map(compra => (
                                        <div key={compra.id} className="compra-card">
                                            <div className="compra-header">
                                                <span className="compra-id">Orden #{compra.id}</span>
                                                {getEstadoBadge(compra.estado)}
                                            </div>
                                            <div className="compra-info">
                                                <p><strong>Fecha:</strong> {formatFecha(compra.fecha_orden)}</p>
                                                <p><strong>Total:</strong> S/ {parseFloat(compra.total).toFixed(2)}</p>
                                                <p><strong>Método de pago:</strong> {compra.metodo_pago}</p>
                                                {compra.productos && (
                                                    <p><strong>Productos:</strong> {compra.productos.length} items</p>
                                                )}
                                            </div>
                                            <div className="compra-actions">
                                                <button
                                                    className="btn-ver-detalle"
                                                    onClick={() => handleVerDetalleCompra(compra)}
                                                >
                                                    Ver Detalle
                                                </button>
                                                {compra.estado === 'pendiente' && (
                                                    <button
                                                        className="btn-cancelar-compra"
                                                        onClick={() => handleCancelarCompra(compra.id)}
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                </div>
            </div>

            {/* Carrito Flotante */}
            <CarritoFlotante onAbrir={() => setShowCarritoModal(true)} />

            {/* Modal del Carrito */}
            <Modal
                isOpen={showCarritoModal}
                onClose={() => setShowCarritoModal(false)}
                title={`🛒 Mi Carrito (${getCantidadTotal()} productos)`}
            >
                <div className="carrito-modal-content">
                    {carrito.length === 0 ? (
                        <div className="carrito-vacio">
                            <p>Tu carrito está vacío</p>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setShowCarritoModal(false);
                                    setActiveTab('tienda');
                                }}
                            >
                                Ir a la Tienda
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="carrito-productos">
                                {carrito.map(producto => (
                                    <div key={producto._id} className="carrito-item">
                                        <div className="carrito-item-info">
                                            <span className="carrito-emoji">
                                                {getCategoriaEmoji(producto.categoria)}
                                            </span>
                                            <div>
                                                <h4>{producto.nombre}</h4>
                                                <p>S/ {producto.precio.toFixed(2)} c/u</p>
                                            </div>
                                        </div>
                                        <div className="carrito-item-cantidad">
                                            <button
                                                onClick={() => actualizarCantidad(producto._id, producto.cantidadCarrito - 1)}
                                            >
                                                -
                                            </button>
                                            <span>{producto.cantidadCarrito}</span>
                                            <button
                                                onClick={() => actualizarCantidad(producto._id, producto.cantidadCarrito + 1)}
                                                disabled={producto.cantidadCarrito >= producto.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="carrito-item-subtotal">
                                            <p>S/ {(producto.precio * producto.cantidadCarrito).toFixed(2)}</p>
                                            <button
                                                className="btn-eliminar-item"
                                                onClick={() => eliminarDelCarrito(producto._id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="carrito-checkout">
                                <div className="metodos-pago-carrito">
                                    <label>Método de Pago:</label>
                                    <div className="metodos-grid">
                                        {['efectivo', 'tarjeta', 'yape', 'plin'].map(metodo => (
                                            <button
                                                key={metodo}
                                                className={`metodo-btn-small ${metodoPago === metodo ? 'active' : ''}`}
                                                onClick={() => setMetodoPago(metodo)}
                                            >
                                                {metodo === 'efectivo' && '💵'}
                                                {metodo === 'tarjeta' && '💳'}
                                                {metodo === 'yape' && '📱'}
                                                {metodo === 'plin' && '📲'}
                                                {' '}{metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="observaciones-carrito">
                                    <label htmlFor="obs">Observaciones (opcional):</label>
                                    <textarea
                                        id="obs"
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        rows="2"
                                        placeholder="Alguna indicación especial..."
                                    />
                                </div>

                                <div className="carrito-total-final">
                                    <span>Total:</span>
                                    <span>S/ {calcularTotal().toFixed(2)}</span>
                                </div>

                                <div className="carrito-acciones">
                                    <button
                                        className="btn-vaciar"
                                        onClick={vaciarCarrito}
                                    >
                                        Vaciar Carrito
                                    </button>
                                    <button
                                        className="btn-finalizar"
                                        onClick={handleFinalizarCompra}
                                        disabled={procesandoCompra}
                                    >
                                        {procesandoCompra ? 'Procesando...' : '✅ Finalizar Compra'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal de Detalle de Compra */}
            <Modal
                isOpen={showDetalleCompra}
                onClose={() => setShowDetalleCompra(false)}
                title={`Detalle de Orden #${compraDetalle?.id}`}
            >
                {compraDetalle && (
                    <div className="detalle-compra">
                        <div className="detalle-section">
                            <h3>📋 Información General</h3>
                            <p><strong>Fecha:</strong> {formatFecha(compraDetalle.fecha_orden)}</p>
                            <p><strong>Estado:</strong> {getEstadoBadge(compraDetalle.estado)}</p>
                            <p><strong>Total:</strong> S/ {parseFloat(compraDetalle.total).toFixed(2)}</p>
                            <p><strong>Método de pago:</strong> {compraDetalle.metodo_pago}</p>
                        </div>

                        <div className="detalle-section">
                            <h3>📦 Productos</h3>
                            {compraDetalle.productos && compraDetalle.productos.map((producto, index) => (
                                <div key={index} className="producto-detalle-item">
                                    <p>
                                        <strong>{producto.producto_nombre}</strong> x{producto.cantidad}
                                    </p>
                                    <p>S/ {parseFloat(producto.subtotal).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {compraDetalle.direccion_entrega && (
                            <div className="detalle-section">
                                <h3>📍 Dirección de Entrega</h3>
                                <p>{compraDetalle.direccion_entrega}</p>
                            </div>
                        )}

                        {compraDetalle.observaciones && (
                            <div className="detalle-section">
                                <h3>📝 Observaciones</h3>
                                <p>{compraDetalle.observaciones}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
<<<<<<< HEAD
=======

            {/* Modal de Factura Electrónica */}
            <ModalFactura
                isOpen={showFacturaModal}
                onClose={() => setShowFacturaModal(false)}
                factura={facturaActual}
                onDescargar={() => {
                    setSuccess('📄 Factura descargada exitosamente');
                    setTimeout(() => setSuccess(''), 3000);
                }}
            />
>>>>>>> 55f2083 (Agregar pop-up automático de factura al completar compra)
        </div>
    );
}

export default PortalCliente;