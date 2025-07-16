const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para formularios URL encoded primero
app.use(express.urlencoded({ extended: true }));

// Middleware para JSON después
app.use(express.json());

// Cargo el menú desde un archivo JSON
let menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

app.post('/message.php', (req, res) => {
  // Log para verificar el content-type que llega
  console.log('Content-Type recibido:', req.headers['content-type']);

  // Log del body para ver qué llegó ya parseado
  console.log('Body recibido:', req.body);

  const { message, sender, phone } = req.body;

  const rawMessage = String(message || "");
  const clave = rawMessage.trim().toLowerCase();

  console.log("🔑 Clave normalizada:", clave);
  console.log("📚 Claves en el menú:", Object.keys(menu));

  let respuesta = menu["default"];
  for (const key of Object.keys(menu)) {
    if (clave === key.trim().toLowerCase()) {
      respuesta = menu[key];
      break;
    }
  }

  console.log(`📤 Respuesta enviada: "${respuesta}"`);
  res.json({ reply: respuesta });
});

app.get("/", (req, res) => {
  res.send("🟢 Servidor WhatsAuto activo");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
