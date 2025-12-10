import api from './api.service';

const FACTURAS_API = '/facturas';

const FacturasService = {
    // Obtener todas las facturas
    getAll: (params = {}) => {
        return api.get(FACTURAS_API, { params });
    },

    // Obtener factura por ID
    getById: (id) => {
        return api.get(`${FACTURAS_API}/${id}`);
    },

    // Obtener factura por número
    getByNumero: (numeroFactura) => {
        return api.get(`${FACTURAS_API}/numero/${numeroFactura}`);
    },

    // Obtener mis facturas (cliente autenticado)
    getMisFacturas: () => {
        return api.get(`${FACTURAS_API}/mis-facturas`);
    },

    // Obtener facturas de un cliente
    getByClienteDni: (dni) => {
        return api.get(`${FACTURAS_API}/cliente/${dni}`);
    },

    // Obtener facturas del día
    getDelDia: () => {
        return api.get(`${FACTURAS_API}/dia`);
    },

    // Obtener estadísticas de facturación
    getEstadisticas: (periodo = 'mes') => {
        return api.get(`${FACTURAS_API}/estadisticas/generales`, {
            params: { periodo }
        });
    },

    // Generar factura desde venta
    generarDesdeVenta: (ventaId, data = {}) => {
        return api.post(`${FACTURAS_API}/generar-desde-venta/${ventaId}`, data);
    },

    // Generar factura desde orden
    generarDesdeOrden: (ordenId) => {
        return api.post(`${FACTURAS_API}/generar-desde-orden/${ordenId}`);
    },

    // Anular factura
    anular: (id, motivo) => {
        return api.put(`${FACTURAS_API}/${id}/anular`, { motivo });
    },

    // Generar PDF de factura (formato para descargar)
    generarPDF: (factura) => {
        // Esta función genera un texto simple de la factura
        // En un escenario real, usarías una librería como jsPDF o html2pdf
        const contenido = `
VETERINARIA MICHI
Factura Electrónica
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Número de Factura: ${factura.numero_factura_formateado}
Fecha de Emisión: ${new Date(factura.fecha_emision).toLocaleString('es-PE')}
Estado: ${factura.estado.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATOS DEL CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cliente: ${factura.cliente_nombre}
DNI: ${factura.cliente_dni || 'No especificado'}
Email: ${factura.cliente_email || 'No especificado'}
${factura.cliente_direccion ? `Dirección: ${factura.cliente_direccion}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DETALLE DE PRODUCTOS/SERVICIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${factura.detalles.map((detalle, index) => `
${index + 1}. ${detalle.descripcion}
   Cantidad: ${detalle.cantidad}
   P. Unitario: S/ ${parseFloat(detalle.precio_unitario).toFixed(2)}
   Subtotal: S/ ${parseFloat(detalle.subtotal).toFixed(2)}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal:           S/ ${parseFloat(factura.subtotal).toFixed(2)}
IGV (18%):          S/ ${parseFloat(factura.igv).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:              S/ ${parseFloat(factura.total).toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Método de Pago: ${factura.metodo_pago.toUpperCase()}
${factura.observaciones ? `\nObservaciones: ${factura.observaciones}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gracias por su preferencia
Veterinaria Michi - RUC: 20123456789
Av. Principal 123, Lima - Perú
Tel: (01) 234-5678 | Email: info@veterinariamichi.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        return contenido;
    },

    // Descargar factura como archivo de texto
    descargarFactura: (factura) => {
        const contenido = FacturasService.generarPDF(factura);
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Factura_${factura.numero_factura_formateado.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

export default FacturasService;
