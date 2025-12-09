import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VentasService from '../services/ventas.service';
import BuscadorProductos from '../components/BuscadorProductos';
import Modal from '../components/Modal';
import './Ventas.css';

function Ventas() {
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [clienteDni, setClienteDni] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [ventasRecientes, setVentasRecientes] = useState([]);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [ventaDetalle, setVentaDetalle] = useState(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        cargarVentasRecientes();
    }, []);

    const cargarVentasRecientes = async () => {
        try {
            const response = await VentasService.getVentasDelDia();
            setVentasRecientes(response.data);
        } catch (err) {
            console.error('Error al cargar ventas:', err);
        }
    };

    const handleProductoSeleccionado = (producto) => {
        setProductoSeleccionado(producto);
        setCantidad(1);
        setError('');
    };

    const calcularTotal = () => {
        if (!productoSeleccionado) return 0;
        return productoSeleccionado.precio * cantidad;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!productoSeleccionado) {
            setError('Selecciona un producto');
            return;
        }

        if (cantidad <= 0) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        if (cantidad > productoSeleccionado.stock) {
            setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
            return;
        }

        try {
            setLoading(true);

            await VentasService.registrarVenta({
                producto_id: productoSeleccionado._id,
                cantidad: cantidad,
                cliente_dni: clienteDni || null,
                metodo_pago: metodoPago,
                observaciones: observaciones || null
            });

            setSuccess('✅ Venta registrada exitosamente');
            
            // Limpiar formulario
            setProductoSeleccionado(null);
            setCantidad(1);
            setClienteDni('');
            setObservaciones('');
            setMetodoPago('efectivo');

            // Recargar ventas recientes
            await cargarVentasRecientes();

            // Limpiar mensaje de éxito después de 3 segundos
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar venta');
        } finally {
            setLoading(false);
        }
    };

    const handleVerDetalle = async (venta) => {
        try {
            const response = await VentasService.getById(venta.id);
            setVentaDetalle(response.data);
            setShowDetalleModal(true);
        } catch (err) {
            setError('Error al cargar detalles de la venta');
        }
    };

    const handleAnularVenta = async (id) => {
        if (!window.confirm('¿Estás seguro de anular esta venta? Se restaurará el stock del producto.')) {
            return;
        }

        try {
            await VentasService.anularVenta(id);
            setSuccess('✅ Venta anulada y stock restaurado');
            await cargarVentasRecientes();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al anular venta');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                    <button onClick={() => navigate('/ventas/estadisticas')} className="btn-stats">
                        📊 Estadísticas
                    </button>
                    <span className="user-name">{user?.nombre} {user?.apellido}</span>
                    <span className="user-role">{user?.rol}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="ventas-container">
                {/* Panel de Venta */}
                <div className="venta-panel">
                    <div className="panel-header">
                        <h2>🛒 Nueva Venta</h2>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="venta-form">
                        {/* Buscador de Productos */}
                        <div className="form-group">
                            <label>Producto *</label>
                            <BuscadorProductos onProductoSeleccionado={handleProductoSeleccionado} />
                        </div>

                        {/* Producto Seleccionado */}
                        {productoSeleccionado && (
                            <div className="producto-seleccionado">
                                <div className="producto-card-venta">
                                    <span className="producto-emoji-grande">
                                        {getCategoriaEmoji(productoSeleccionado.categoria)}
                                    </span>
                                    <div className="producto-info-venta">
                                        <h3>{productoSeleccionado.nombre}</h3>
                                        <p className="precio-unitario">
                                            S/ {productoSeleccionado.precio.toFixed(2)} / {productoSeleccionado.unidadMedida}
                                        </p>
                                        <p className="stock-disponible">
                                            Stock disponible: {productoSeleccionado.stock} {productoSeleccionado.unidadMedida}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => setProductoSeleccionado(null)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Cantidad */}
                                <div className="form-group">
                                    <label htmlFor="cantidad">Cantidad *</label>
                                    <div className="cantidad-input">
                                        <button
                                            type="button"
                                            className="btn-cantidad"
                                            onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            id="cantidad"
                                            value={cantidad}
                                            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                            max={productoSeleccionado.stock}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn-cantidad"
                                            onClick={() => setCantidad(Math.min(productoSeleccionado.stock, cantidad + 1))}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="total-venta">
                                    <span className="total-label">Total:</span>
                                    <span className="total-precio">S/ {calcularTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Cliente (Opcional) */}
                        <div className="form-group">
                            <label htmlFor="clienteDni">DNI del Cliente (Opcional)</label>
                            <input
                                type="text"
                                id="clienteDni"
                                value={clienteDni}
                                onChange={(e) => setClienteDni(e.target.value)}
                                placeholder="12345678"
                                maxLength="8"
                            />
                        </div>

                        {/* Método de Pago */}
                        <div className="form-group">
                            <label>Método de Pago *</label>
                            <div className="metodos-pago">
                                <button
                                    type="button"
                                    className={`metodo-btn ${metodoPago === 'efectivo' ? 'active' : ''}`}
                                    onClick={() => setMetodoPago('efectivo')}
                                >
                                    💵 Efectivo
                                </button>
                                <button
                                    type="button"
                                    className={`metodo-btn ${metodoPago === 'tarjeta' ? 'active' : ''}`}
                                    onClick={() => setMetodoPago('tarjeta')}
                                >
                                    💳 Tarjeta
                                </button>
                                <button
                                    type="button"
                                    className={`metodo-btn ${metodoPago === 'yape' ? 'active' : ''}`}
                                    onClick={() => setMetodoPago('yape')}
                                >
                                    📱 Yape
                                </button>
                                <button
                                    type="button"
                                    className={`metodo-btn ${metodoPago === 'plin' ? 'active' : ''}`}
                                    onClick={() => setMetodoPago('plin')}
                                >
                                    📲 Plin
                                </button>
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="form-group">
                            <label htmlFor="observaciones">Observaciones</label>
                            <textarea
                                id="observaciones"
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows="2"
                                placeholder="Observaciones adicionales..."
                            />
                        </div>

                        {/* Botón de Venta */}
                        <button
                            type="submit"
                            className="btn-vender"
                            disabled={!productoSeleccionado || loading}
                        >
                            {loading ? 'Procesando...' : '✅ Confirmar Venta'}
                        </button>
                    </form>
                </div>

                {/* Panel de Ventas Recientes */}
                <div className="ventas-recientes-panel">
                    <div className="panel-header">
                        <h2>📋 Ventas de Hoy</h2>
                        <span className="count-badge">{ventasRecientes.length}</span>
                    </div>

                    <div className="ventas-list">
                        {ventasRecientes.length === 0 ? (
                            <div className="no-ventas">
                                No hay ventas registradas hoy
                            </div>
                        ) : (
                            ventasRecientes.map(venta => (
                                <div key={venta.id} className="venta-item">
                                    <div className="venta-info">
                                        <div className="venta-header">
                                            <span className="venta-emoji">
                                                {getCategoriaEmoji(venta.producto_categoria)}
                                            </span>
                                            <div>
                                                <strong>{venta.producto_nombre}</strong>
                                                <p className="venta-fecha">{formatFecha(venta.fecha_venta)}</p>
                                            </div>
                                        </div>
                                        <div className="venta-detalles">
                                            <p>Cantidad: {venta.cantidad}</p>
                                            <p className="venta-total">S/ {parseFloat(venta.precio_total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="venta-actions">
                                        <button
                                            className="btn-ver"
                                            onClick={() => handleVerDetalle(venta)}
                                            title="Ver detalles"
                                        >
                                            👁️
                                        </button>
                                        {isAdmin && venta.activo && (
                                            <button
                                                className="btn-anular"
                                                onClick={() => handleAnularVenta(venta.id)}
                                                title="Anular venta"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalle de Venta */}
            <Modal
                isOpen={showDetalleModal}
                onClose={() => setShowDetalleModal(false)}
                title="Detalles de la Venta"
            >
                {ventaDetalle && (
                    <div className="detalle-venta">
                        <div className="detalle-section">
                            <h3>📦 Producto</h3>
                            <p><strong>Nombre:</strong> {ventaDetalle.producto_nombre}</p>
                            <p><strong>Categoría:</strong> {ventaDetalle.producto_categoria}</p>
                            <p><strong>Cantidad:</strong> {ventaDetalle.cantidad}</p>
                            <p><strong>Precio Unitario:</strong> S/ {parseFloat(ventaDetalle.precio_unitario).toFixed(2)}</p>
                            <p><strong>Total:</strong> S/ {parseFloat(ventaDetalle.precio_total).toFixed(2)}</p>
                        </div>

                        {ventaDetalle.cliente_nombre && (
                            <div className="detalle-section">
                                <h3>👤 Cliente</h3>
                                <p><strong>DNI:</strong> {ventaDetalle.cliente_dni}</p>
                                <p><strong>Nombre:</strong> {ventaDetalle.cliente_nombre}</p>
                            </div>
                        )}

                        <div className="detalle-section">
                            <h3>💰 Pago</h3>
                            <p><strong>Método:</strong> {ventaDetalle.metodo_pago}</p>
                            <p><strong>Fecha:</strong> {formatFecha(ventaDetalle.fecha_venta)}</p>
                        </div>

                        {ventaDetalle.vendedor_nombre && (
                            <div className="detalle-section">
                                <h3>👨‍💼 Vendedor</h3>
                                <p>{ventaDetalle.vendedor_nombre}</p>
                            </div>
                        )}

                        {ventaDetalle.observaciones && (
                            <div className="detalle-section">
                                <h3>📝 Observaciones</h3>
                                <p>{ventaDetalle.observaciones}</p>
                            </div>
                        )}

                        <div className="detalle-section">
                            <h3>📊 Estado</h3>
                            <p className={ventaDetalle.activo ? 'estado-activo' : 'estado-anulado'}>
                                {ventaDetalle.activo ? '✅ Activa' : '❌ Anulada'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Ventas;