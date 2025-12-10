const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto_jwt_veterinaria_2024_cambiar_en_produccion";

const tokenInterno = jwt.sign(
    {
        servicio: "mascotas-service",
        rol: "admin"
    },
    JWT_SECRET,
    { expiresIn: "30d" }
);

module.exports = tokenInterno;