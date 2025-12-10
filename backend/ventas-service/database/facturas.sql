-- Script de creación de tablas para el sistema de facturación electrónica
-- Base de datos: veterinaria_ventas

USE veterinaria_ventas;

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_factura INT NOT NULL UNIQUE,
    numero_factura_formateado VARCHAR(20) NOT NULL UNIQUE,
    tipo_transaccion ENUM('venta', 'orden') NOT NULL,
    referencia_id INT NOT NULL,
    cliente_dni VARCHAR(20),
    cliente_nombre VARCHAR(255) NOT NULL DEFAULT 'Cliente General',
    cliente_email VARCHAR(255),
    cliente_direccion TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    observaciones TEXT,
    estado ENUM('emitida', 'anulada') NOT NULL DEFAULT 'emitida',
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo_referencia (tipo_transaccion, referencia_id),
    INDEX idx_cliente_dni (cliente_dni),
    INDEX idx_estado (estado),
    INDEX idx_fecha_emision (fecha_emision),
    INDEX idx_numero_factura_formateado (numero_factura_formateado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalles de facturas
CREATE TABLE IF NOT EXISTS facturas_detalle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factura_id INT NOT NULL,
    producto_id VARCHAR(50),
    descripcion VARCHAR(500) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    INDEX idx_factura_id (factura_id),
    INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de documentación
ALTER TABLE facturas
    COMMENT = 'Tabla principal de facturas electrónicas',
    MODIFY COLUMN numero_factura INT NOT NULL UNIQUE COMMENT 'Número secuencial de la factura',
    MODIFY COLUMN numero_factura_formateado VARCHAR(20) NOT NULL UNIQUE COMMENT 'Formato: F001-00000001',
    MODIFY COLUMN tipo_transaccion ENUM('venta', 'orden') NOT NULL COMMENT 'Tipo de transacción que originó la factura',
    MODIFY COLUMN referencia_id INT NOT NULL COMMENT 'ID de la venta u orden asociada',
    MODIFY COLUMN subtotal DECIMAL(10, 2) NOT NULL COMMENT 'Subtotal sin IGV',
    MODIFY COLUMN igv DECIMAL(10, 2) NOT NULL COMMENT 'Impuesto General a las Ventas (18%)',
    MODIFY COLUMN total DECIMAL(10, 2) NOT NULL COMMENT 'Total incluyendo IGV',
    MODIFY COLUMN estado ENUM('emitida', 'anulada') NOT NULL DEFAULT 'emitida' COMMENT 'Estado de la factura';

ALTER TABLE facturas_detalle
    COMMENT = 'Detalle de productos/servicios en cada factura',
    MODIFY COLUMN descripcion VARCHAR(500) NOT NULL COMMENT 'Descripción del producto o servicio',
    MODIFY COLUMN cantidad DECIMAL(10, 2) NOT NULL COMMENT 'Cantidad del producto',
    MODIFY COLUMN precio_unitario DECIMAL(10, 2) NOT NULL COMMENT 'Precio unitario sin IGV',
    MODIFY COLUMN subtotal DECIMAL(10, 2) NOT NULL COMMENT 'Subtotal de la línea (cantidad * precio_unitario)';

-- Insertar datos de prueba (opcional)
-- Nota: Estos datos solo funcionarán si ya existen ventas u órdenes en las tablas correspondientes

-- SELECT '✅ Tablas de facturas creadas exitosamente' AS mensaje;
