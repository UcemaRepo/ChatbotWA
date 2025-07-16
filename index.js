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
    req.rawBodyText = raw.toString();
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

  let mensajeTexto = req.body?.message || '';
  if (!mensajeTexto && req.rawBodyText) {
    // Parseamos si vino en formato application/x-www-form-urlencoded manualmente
    const params = new URLSearchParams(req.rawBodyText);
    mensajeTexto = params.get('message') || '';
  }

  const clave = mensajeTexto.trim().toLowerCase();
  console.log("🔑 Clave normalizada:", clave);

  if (menu[clave]) {
    const respuesta = `${menu[clave].descripcion}\n👉 Contactá con un asesor: https://wa.me/${menu[clave].asesor}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(clave)}`;
    console.log(`📤 Respuesta enviada: "${respuesta}"`);
    res.json({ reply: respuesta });
  } else {
    console.log("📤 Respuesta enviada (default):", menu.default);
    res.json({ reply: menu.default });
  }
});

app.get("/", (req, res) => {
  res.send("🟢 Servidor WhatsAuto activo");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});



