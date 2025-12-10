# Sistema de Facturación Electrónica

## Descripción

Este módulo implementa un sistema de facturación electrónica automática para la Veterinaria Michi. Cada vez que se realiza una venta (venta directa o compra de cliente), se genera automáticamente una factura electrónica con toda la información requerida.

## Características

- ✅ **Generación automática**: Las facturas se generan automáticamente al realizar una venta o compra
- ✅ **Numeración secuencial**: Cada factura tiene un número único con formato F001-00000001
- ✅ **Cálculo de impuestos**: Calcula automáticamente el IGV (18% en Perú)
- ✅ **Soporte para múltiples productos**: Una factura puede contener varios productos
- ✅ **Historial completo**: Los clientes pueden consultar todas sus facturas
- ✅ **Anulación de facturas**: Las facturas pueden ser anuladas por administradores
- ✅ **Estadísticas**: Reportes y estadísticas de facturación

## Estructura de Base de Datos

### Tabla: facturas

```sql
CREATE TABLE facturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_factura INT NOT NULL UNIQUE,
    numero_factura_formateado VARCHAR(20) NOT NULL UNIQUE,
    tipo_transaccion ENUM('venta', 'orden') NOT NULL,
    referencia_id INT NOT NULL,
    cliente_dni VARCHAR(20),
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255),
    cliente_direccion TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    observaciones TEXT,
    estado ENUM('emitida', 'anulada') NOT NULL DEFAULT 'emitida',
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: facturas_detalle

```sql
CREATE TABLE facturas_detalle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    factura_id INT NOT NULL,
    producto_id VARCHAR(50),
    descripcion VARCHAR(500) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
);
```

## API Endpoints

### Consultar Facturas

#### GET /api/facturas
Obtiene todas las facturas con filtros opcionales.

**Query Parameters:**
- `cliente_dni`: Filtrar por DNI del cliente
- `estado`: Filtrar por estado (emitida, anulada)
- `tipo_transaccion`: Filtrar por tipo (venta, orden)
- `fechaInicio`: Fecha de inicio
- `fechaFin`: Fecha de fin
- `limit`: Límite de resultados

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### GET /api/facturas/:id
Obtiene una factura específica por su ID.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero_factura_formateado": "F001-00000001",
    "tipo_transaccion": "orden",
    "cliente_nombre": "Juan Pérez",
    "total": 150.00,
    "detalles": [...]
  }
}
```

#### GET /api/facturas/numero/:numeroFactura
Obtiene una factura por su número formateado (ej: F001-00000001).

#### GET /api/facturas/mis-facturas
Obtiene todas las facturas del usuario autenticado.

#### GET /api/facturas/cliente/:dni
Obtiene todas las facturas de un cliente específico.

#### GET /api/facturas/dia
Obtiene las facturas emitidas el día actual.

### Generar Facturas

#### POST /api/facturas/generar-desde-venta/:ventaId
Genera una factura desde una venta existente.

**Body (opcional):**
```json
{
  "cliente_email": "cliente@example.com",
  "cliente_direccion": "Av. Principal 123"
}
```

#### POST /api/facturas/generar-desde-orden/:ordenId
Genera una factura desde una orden existente.

### Anular Facturas

#### PUT /api/facturas/:id/anular
Anula una factura (solo administradores).

**Body:**
```json
{
  "motivo": "Razón de la anulación"
}
```

### Estadísticas

#### GET /api/facturas/estadisticas/generales
Obtiene estadísticas de facturación.

**Query Parameters:**
- `periodo`: dia, semana, mes, año

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_facturas": 100,
    "facturas_emitidas": 95,
    "facturas_anuladas": 5,
    "total_facturado": 15000.00,
    "ticket_promedio": 157.89
  }
}
```

## Generación Automática

### Venta Directa
Cuando un trabajador registra una venta en mostrador (`POST /api/ventas`), se genera automáticamente una factura:

1. Se registra la venta en la tabla `ventas`
2. Se reduce el stock del producto
3. Se genera la factura con:
   - Cálculo automático de subtotal e IGV
   - Datos del cliente (si está disponible)
   - Información del producto
4. La factura se devuelve en la respuesta junto con la venta

### Compra de Cliente
Cuando un cliente realiza una compra (`POST /api/ordenes/comprar`), se genera automáticamente una factura:

1. Se validan todos los productos del carrito
2. Se crea la orden con todos los productos
3. Se reduce el stock de cada producto
4. Se genera la factura con:
   - Cálculo automático de subtotal e IGV
   - Datos completos del cliente
   - Detalles de todos los productos
5. La factura se devuelve en la respuesta junto con la orden

## Ejemplo de Uso

### Cliente realizando una compra

```javascript
// 1. El cliente agrega productos al carrito y realiza la compra
POST /api/ordenes/comprar
{
  "productos": [
    { "producto_id": "abc123", "cantidad": 2 },
    { "producto_id": "def456", "cantidad": 1 }
  ],
  "metodo_pago": "tarjeta",
  "direccion_entrega": "Av. Principal 123"
}

// 2. Se recibe la respuesta con la orden y la factura
{
  "success": true,
  "message": "¡Compra realizada exitosamente!",
  "data": { /* orden */ },
  "factura": {
    "id": 15,
    "numero_factura_formateado": "F001-00000015",
    "subtotal": 127.12,
    "igv": 22.88,
    "total": 150.00,
    "detalles": [...]
  }
}
```

### Consultar mis facturas

```javascript
// El cliente puede ver todas sus facturas
GET /api/facturas/mis-facturas

{
  "success": true,
  "data": [
    {
      "numero_factura_formateado": "F001-00000015",
      "fecha_emision": "2025-12-10T10:30:00",
      "total": 150.00,
      "estado": "emitida"
    },
    ...
  ],
  "count": 10
}
```

## Instalación

1. **Ejecutar el script SQL para crear las tablas:**

```bash
mysql -u root -p veterinaria_ventas < database/facturas.sql
```

2. **Las dependencias ya están instaladas en el proyecto**

3. **Reiniciar el servicio de ventas:**

```bash
cd backend/ventas-service
npm start
```

## Formato de Factura

- **Número de factura**: F001-00000001 (Serie F001, número secuencial de 8 dígitos)
- **Subtotal**: Monto sin IGV
- **IGV**: 18% del subtotal (estándar en Perú)
- **Total**: Subtotal + IGV

## Notas Importantes

1. Las facturas se generan automáticamente, no requieren intervención manual
2. Si la generación de la factura falla, no afecta la venta/orden principal
3. Cada factura está vinculada a una venta u orden específica
4. Solo se puede generar una factura por venta/orden
5. Las facturas anuladas se mantienen en el sistema para auditoría
6. El cálculo de IGV es del 18% (estándar peruano)

## Futuras Mejoras

- [ ] Exportación de facturas a PDF
- [ ] Envío automático por correo electrónico
- [ ] Integración con SUNAT (Sistema tributario peruano)
- [ ] Generación de reportes mensuales
- [ ] Firma digital de facturas
- [ ] Facturas en XML (formato estándar)
