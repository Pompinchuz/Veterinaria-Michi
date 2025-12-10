import { createContext, useState, useContext, useEffect } from 'react';

const CarritoContext = createContext(null);

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState(() => {
        // Cargar carrito desde localStorage
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto, cantidad = 1) => {
        setCarrito(prevCarrito => {
            const productoExistente = prevCarrito.find(item => item._id === producto._id);

            if (productoExistente) {
                // Si ya existe, aumentar cantidad
                return prevCarrito.map(item =>
                    item._id === producto._id
                        ? { ...item, cantidadCarrito: Math.min(item.cantidadCarrito + cantidad, producto.stock) }
                        : item
                );
            } else {
                // Si no existe, agregarlo
                return [...prevCarrito, { ...producto, cantidadCarrito: cantidad }];
            }
        });
    };

    // Actualizar cantidad de un producto
    const actualizarCantidad = (productoId, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }

        setCarrito(prevCarrito =>
            prevCarrito.map(item =>
                item._id === productoId
                    ? { ...item, cantidadCarrito: Math.min(nuevaCantidad, item.stock) }
                    : item
            )
        );
    };

    // Eliminar producto del carrito
    const eliminarDelCarrito = (productoId) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => item._id !== productoId));
    };

    // Vaciar carrito
    const vaciarCarrito = () => {
        setCarrito([]);
        localStorage.removeItem('carrito');
    };

    // Calcular total del carrito
    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidadCarrito), 0);
    };

    // Obtener cantidad total de productos
    const getCantidadTotal = () => {
        return carrito.reduce((total, item) => total + item.cantidadCarrito, 0);
    };

    const value = {
        carrito,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        calcularTotal,
        getCantidadTotal
    };

    return (
        <CarritoContext.Provider value={value}>
            {children}
        </CarritoContext.Provider>
    );
};

export const useCarrito = () => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider');
    }
    return context;
};

export default CarritoContext;