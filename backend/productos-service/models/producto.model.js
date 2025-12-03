const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: ['alimento', 'juguete', 'medicina', 'accesorio', 'higiene', 'otro'],
        lowercase: true
    },
    subcategoria: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    stockMinimo: {
        type: Number,
        default: 5
    },
    unidadMedida: {
        type: String,
        enum: ['unidad', 'kilogramo', 'gramo', 'litro', 'mililitro', 'caja', 'paquete'],
        default: 'unidad'
    },
    marca: {
        type: String,
        trim: true
    },
    proveedor: {
        type: String,
        trim: true
    },
    // Atributos flexibles según el tipo de producto
    atributos: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // Ejemplos:
        // Para alimentos: {peso: "1kg", sabor: "pollo", tipoAnimal: "perro"}
        // Para juguetes: {material: "goma", talla: "M", color: "azul"}
        // Para medicinas: {principioActivo: "...", dosis: "...", presentacion: "..."}
    },
    imagenUrl: {
        type: String,
        default: ''
    },
    codigoBarras: {
        type: String,
        sparse: true // Permite que sea opcional pero único si existe
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaVencimiento: {
        type: Date
    }
}, {
    timestamps: true
});

// Índices para búsquedas más rápidas
productoSchema.index({ nombre: 1 });
productoSchema.index({ categoria: 1 });
productoSchema.index({ codigoBarras: 1 }, { unique: true, sparse: true });

// Virtual para saber si el stock está bajo
productoSchema.virtual('stockBajo').get(function() {
    return this.stock <= this.stockMinimo;
});

// Incluir virtuals en JSON
productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);