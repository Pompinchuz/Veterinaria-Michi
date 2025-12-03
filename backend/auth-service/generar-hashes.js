const bcrypt = require('bcryptjs');

async function generarHashes() {
    const passwords = {
        admin123: await bcrypt.hash('admin123', 10),
        vet123: await bcrypt.hash('vet123', 10),
        enf123: await bcrypt.hash('enf123', 10),
        cliente123: await bcrypt.hash('cliente123', 10)
    };

    console.log('=== HASHES GENERADOS ===\n');
    console.log('admin123:', passwords.admin123);
    console.log('vet123:', passwords.vet123);
    console.log('enf123:', passwords.enf123);
    console.log('cliente123:', passwords.cliente123);
}

generarHashes();