const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB - Base de datos: veterinaria_mascotas');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

// Eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error en MongoDB:', err);
});

module.exports = connectDB;