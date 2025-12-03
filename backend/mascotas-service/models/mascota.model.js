const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    especie: {
        type: String,
        required: [true, 'La especie es obligatoria'],
        enum: ['perro', 'gato', 'ave', 'conejo', 'hamster', 'otro'],
        lowercase: true
    },
    raza: {
        type: String,
        trim: true,
        default: 'Mestizo'
    },
    edad: {
        type: Number,
        min: [0, 'La edad no puede ser negativa'],
        default: 0
    },
    peso: {
        type: Number,
        min: [0, 'El peso no puede ser negativo']
    },
    sexo: {
        type: String,
        enum: ['macho', 'hembra'],
        lowercase: true
    },
    color: {
        type: String,
        trim: true
    },
    clienteDni: {
        type: String,
        required: [true, 'El DNI del cliente es obligatorio'],
        validate: {
            validator: function(v) {
                return /^\d{8}$/.test(v);
            },
            message: 'El DNI debe tener 8 dígitos'
        }
    },
    // Información del cliente (se guarda para consultas rápidas)
    clienteInfo: {
        nombres: String,
        apellidos: String
    },
    historialMedico: [{
        fecha: {
            type: Date,
            default: Date.now
        },
        descripcion: {
            type: String,
            required: true
        },
        veterinario: String,
        diagnostico: String,
        tratamiento: String
    }],
    vacunas: [{
        nombre: {
            type: String,
            required: true
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        proximaDosis: Date,
        lote: String,
        veterinario: String
    }],
    observaciones: {
        type: String
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    autoCreate: true,
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Índices para búsquedas más rápidas
mascotaSchema.index({ clienteDni: 1 });
mascotaSchema.index({ nombre: 1 });
mascotaSchema.index({ especie: 1 });

module.exports = mongoose.model('Mascota', mascotaSchema);