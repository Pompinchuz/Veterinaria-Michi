import { useCarrito } from '../context/CarritoContext';
import './CarritoFlotante.css';

function CarritoFlotante({ onAbrir }) {
    const { carrito, getCantidadTotal, calcularTotal } = useCarrito();

    if (carrito.length === 0) return null;

    return (
        <div className="carrito-flotante" onClick={onAbrir}>
            <div className="carrito-icono">
                🛒
                <span className="carrito-badge">{getCantidadTotal()}</span>
            </div>
            <div className="carrito-info">
                <p className="carrito-label">Total</p>
                <p className="carrito-total">S/ {calcularTotal().toFixed(2)}</p>
            </div>
        </div>
    );
}

export default CarritoFlotante;