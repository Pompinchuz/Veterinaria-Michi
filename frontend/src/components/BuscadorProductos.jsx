import { useState, useEffect } from 'react';
import ProductosService from '../services/productos.service';
import './BuscadorProductos.css';

function BuscadorProductos({ onProductoSeleccionado }) {
    const [termino, setTermino] = useState('');
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    useEffect(() => {
        if (termino.length >= 2) {
            buscarProductos();
        } else {
            setProductos([]);
            setMostrarResultados(false);
        }
    }, [termino]);

    const buscarProductos = async () => {
        try {
            setLoading(true);
            const response = await ProductosService.search(termino);
            setProductos(response.data);
            setMostrarResultados(true);
        } catch (err) {
            console.error('Error al buscar productos:', err);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSeleccionar = (producto) => {
        onProductoSeleccionado(producto);
        setTermino('');
        setProductos([]);
        setMostrarResultados(false);
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

    return (
        <div className="buscador-productos">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="🔍 Buscar producto por nombre, código o marca..."
                    value={termino}
                    onChange={(e) => setTermino(e.target.value)}
                    className="search-input"
                    autoComplete="off"
                />
                {loading && <span className="loading-icon">⏳</span>}
            </div>

            {mostrarResultados && productos.length > 0 && (
                <div className="resultados-busqueda">
                    {productos.map(producto => (
                        <div
                            key={producto._id}
                            className="resultado-item"
                            onClick={() => handleSeleccionar(producto)}
                        >
                            <span className="producto-emoji">
                                {getCategoriaEmoji(producto.categoria)}
                            </span>
                            <div className="producto-info">
                                <strong>{producto.nombre}</strong>
                                <span className="producto-detalle">
                                    {producto.marca && `${producto.marca} - `}
                                    S/ {producto.precio.toFixed(2)} - 
                                    Stock: {producto.stock} {producto.unidadMedida}
                                </span>
                            </div>
                            <button className="btn-seleccionar">+</button>
                        </div>
                    ))}
                </div>
            )}

            {mostrarResultados && productos.length === 0 && !loading && (
                <div className="no-resultados">
                    No se encontraron productos
                </div>
            )}
        </div>
    );
}

export default BuscadorProductos;