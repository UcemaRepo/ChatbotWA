const express = require('express');
const getRawBody = require('raw-body');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para capturar el body RAW antes de parsearlo
app.use(async (req, res, next) => {
  try {
    const raw = await getRawBody(req);
    console.log('Body RAW recibido:', raw.toString());
    next();
  } catch (err) {
    next(err);
  }
});

// Middleware para URL encoded (formularios)
app.use(express.urlencoded({ extended: true }));

// Middleware para JSON
app.use(express.json());

// Cargo el menú desde un JSON local
let menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

app.post('/message.php', (req, res) => {
  console.log('Content-Type recibido:', req.headers['content-type']);
  console.log('Body recibido:', req.body);

  const { message, sender, phone } = req.body || {};

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
