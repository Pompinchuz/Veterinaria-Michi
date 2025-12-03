const Producto = require('../models/producto.model');

class ProductosController {

    // GET /api/productos - Obtener todos los productos
    static async obtenerTodosProductos(req, res) {
        try {
            const { categoria, stockBajo } = req.query;
            
            let filtro = { activo: true };

            // Filtrar por categoría si se especifica
            if (categoria) {
                filtro.categoria = categoria.toLowerCase();
            }

            const productos = await Producto.find(filtro).sort({ nombre: 1 });

            // Filtrar productos con stock bajo si se solicita
            let productosFiltrados = productos;
            if (stockBajo === 'true') {
                productosFiltrados = productos.filter(p => p.stockBajo);
            }

            res.json({
                success: true,
                data: productosFiltrados,
                count: productosFiltrados.length
            });
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: error.message
            });
        }
    }

    // GET /api/productos/:id - Obtener producto por ID
    static async obtenerProductoPorId(req, res) {
        try {
            const { id } = req.params;
            const producto = await Producto.findById(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró producto con ID: ${id}`
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            console.error('Error al buscar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar producto',
                error: error.message
            });
        }
    }

    // GET /api/productos/codigo/:codigoBarras - Buscar por código de barras
    static async obtenerProductoPorCodigo(req, res) {
        try {
            const { codigoBarras } = req.params;
            const producto = await Producto.findOne({ codigoBarras, activo: true });

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró producto con código: ${codigoBarras}`
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            console.error('Error al buscar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar producto',
                error: error.message
            });
        }
    }

    // GET /api/productos/buscar/:termino - Buscar productos por nombre
    static async buscarProductos(req, res) {
        try {
            const { termino } = req.params;
            
            const productos = await Producto.find({
                activo: true,
                $or: [
                    { nombre: { $regex: termino, $options: 'i' } },
                    { descripcion: { $regex: termino, $options: 'i' } },
                    { marca: { $regex: termino, $options: 'i' } }
                ]
            }).sort({ nombre: 1 });

            res.json({
                success: true,
                data: productos,
                count: productos.length,
                termino: termino
            });
        } catch (error) {
            console.error('Error al buscar productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar productos',
                error: error.message
            });
        }
    }

    // POST /api/productos - Crear nuevo producto
    static async crearProducto(req, res) {
        try {
            const nuevoProducto = new Producto(req.body);
            await nuevoProducto.save();

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: nuevoProducto
            });
        } catch (error) {
            console.error('Error al crear producto:', error);
            
            // Errores de validación de Mongoose
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            // Error de código de barras duplicado
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un producto con ese código de barras'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al crear producto',
                error: error.message
            });
        }
    }

    // PUT /api/productos/:id - Actualizar producto
    static async actualizarProducto(req, res) {
        try {
            const { id } = req.params;

            const productoActualizado = await Producto.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!productoActualizado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró producto con ID: ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: productoActualizado
            });
        } catch (error) {
            console.error('Error al actualizar producto:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al actualizar producto',
                error: error.message
            });
        }
    }

    // PATCH /api/productos/:id/stock - Actualizar solo el stock
    static async actualizarStock(req, res) {
        try {
            const { id } = req.params;
            const { cantidad, operacion } = req.body; // operacion: 'sumar' o 'restar'

            const producto = await Producto.findById(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró producto con ID: ${id}`
                });
            }

            if (operacion === 'sumar') {
                producto.stock += cantidad;
            } else if (operacion === 'restar') {
                if (producto.stock < cantidad) {
                    return res.status(400).json({
                        success: false,
                        message: 'Stock insuficiente para realizar la operación'
                    });
                }
                producto.stock -= cantidad;
            } else {
                // Si no se especifica operación, se asigna directamente
                producto.stock = cantidad;
            }

            await producto.save();

            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: producto
            });
        } catch (error) {
            console.error('Error al actualizar stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar stock',
                error: error.message
            });
        }
    }

    // DELETE /api/productos/:id - Eliminar (soft delete) producto
    static async eliminarProducto(req, res) {
        try {
            const { id } = req.params;

            const producto = await Producto.findByIdAndUpdate(
                id,
                { activo: false },
                { new: true }
            );

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró producto con ID: ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto',
                error: error.message
            });
        }
    }

    // GET /api/productos/categorias/lista - Obtener lista de categorías disponibles
    static async obtenerCategorias(req, res) {
        try {
            const categorias = await Producto.distinct('categoria', { activo: true });
            
            res.json({
                success: true,
                data: categorias,
                count: categorias.length
            });
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener categorías',
                error: error.message
            });
        }
    }
}

module.exports = ProductosController;