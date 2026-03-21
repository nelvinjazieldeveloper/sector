const os = require('os');
const fs = require('fs');
const path = require('path');

const nets = os.networkInterfaces();
let currentIp = '';

// Buscar la IP local activa (priorizando IPv4 y no interna)
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === 'IPv4' && !net.internal) {
      // Priorizar la red principal del usuario (192.168.101.x)
      if (net.address.startsWith('192.168.101.')) {
        currentIp = net.address;
        break;
      }
      // Evitar adaptadores virtuales comunes si es posible
      if (!currentIp || currentIp.startsWith('192.168.137.')) {
        currentIp = net.address;
      }
    }
  }
}

if (currentIp) {
  const configPath = path.join(__dirname, 'config.js');
  if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    // Reemplazar cualquier IP por la nueva
    const newContent = content.replace(/(\d+\.\d+\.\d+\.\d+)/, currentIp);
    fs.writeFileSync(configPath, newContent);
    console.log(`✅ IP actualizada exitosamente a: ${currentIp} en config.js`);
  } else {
    console.error("❌ No se encontró config.js en esta carpeta.");
  }
} else {
  console.error("❌ No se pudo detectar una IP local activa.");
}
