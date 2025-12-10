import { useEffect } from 'react';
import FacturasService from '../services/facturas.service';
import './ModalFactura.css';

function ModalFactura({ isOpen, onClose, factura, onDescargar }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !factura) return null;

    const handleDescargar = () => {
        FacturasService.descargarFactura(factura);
        if (onDescargar) {
            onDescargar();
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-factura-overlay" onClick={onClose}>
            <div className="modal-factura-container" onClick={(e) => e.stopPropagation()}>
                {/* Encabezado con animación */}
                <div className="modal-factura-header">
                    <div className="success-animation">
                        <div className="checkmark-circle">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        </div>
                    </div>
                    <h2>🎉 ¡Compra Exitosa!</h2>
                    <p className="subtitle">Tu factura electrónica ha sido generada</p>
                </div>

                {/* Información de la factura */}
                <div className="modal-factura-content">
                    <div className="factura-card">
                        <div className="factura-numero-section">
                            <span className="factura-label">Factura Nº</span>
                            <span className="factura-numero">{factura.numero_factura_formateado}</span>
                        </div>

                        <div className="factura-info-grid">
                            <div className="info-item">
                                <span className="info-label">📅 Fecha</span>
                                <span className="info-value">{formatFecha(factura.fecha_emision)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">💳 Método de Pago</span>
                                <span className="info-value">{factura.metodo_pago.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="factura-cliente-section">
                            <h3>Cliente</h3>
                            <p><strong>{factura.cliente_nombre}</strong></p>
                            {factura.cliente_dni && <p>DNI: {factura.cliente_dni}</p>}
                            {factura.cliente_email && <p>📧 {factura.cliente_email}</p>}
                        </div>

                        <div className="factura-productos-section">
                            <h3>Detalle de Compra</h3>
                            <div className="productos-list">
                                {factura.detalles && factura.detalles.map((detalle, index) => (
                                    <div key={index} className="producto-item">
                                        <div className="producto-info">
                                            <span className="producto-nombre">{detalle.descripcion}</span>
                                            <span className="producto-cantidad">x{detalle.cantidad}</span>
                                        </div>
                                        <span className="producto-precio">
                                            S/ {parseFloat(detalle.subtotal).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="factura-totales">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>S/ {parseFloat(factura.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>IGV (18%)</span>
                                <span>S/ {parseFloat(factura.igv).toFixed(2)}</span>
                            </div>
                            <div className="total-row total-final">
                                <span>TOTAL</span>
                                <span>S/ {parseFloat(factura.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="modal-factura-footer">
                    <button className="btn-descargar-factura" onClick={handleDescargar}>
                        📄 Descargar Factura
                    </button>
                    <button className="btn-cerrar-factura" onClick={onClose}>
                        Cerrar
                    </button>
                </div>

                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>
            </div>
        </div>
    );
}

export default ModalFactura;
