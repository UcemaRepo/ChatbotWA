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

// Mapeo de opciones numéricas → nombres clave del menú
const opcionesNumericas = {
  "1": "ingeniería en inteligencia artificial",
  "2": "ingeniería en informática",
  "3": "licenciatura en negocios digitales",
  "4": "licenciatura en finanzas",
  "5": "licenciatura en economía",
  "6": "licenciatura en economía empresarial",
  "7": "licenciatura en administración de empresas",
  "8": "licenciatura en marketing",
  "9": "licenciatura en artes liberales y ciencias",
  "10": "licenciatura en ciencias políticas",
  "11": "licenciatura en relaciones internacionales",
  "12": "licenciatura en analítica de negocios",
  "13": "actuario",
  "14": "contador público",
  "15": "abogacía"
};

app.post('/message.php', (req, res) => {
  console.log('Content-Type recibido:', req.headers['content-type']);
  console.log('Body recibido:', req.body);

  let mensajeTexto = req.body?.message || '';
  if (!mensajeTexto && req.rawBodyText) {
    const params = new URLSearchParams(req.rawBodyText);
    mensajeTexto = params.get('message') || '';
  }

  const claveEntrada = mensajeTexto.trim().toLowerCase();
  console.log("🔑 Clave normalizada:", claveEntrada);

  const claveFinal = opcionesNumericas[claveEntrada] || claveEntrada;

  if (menu[claveFinal]) {
    const respuesta = `${menu[claveFinal].descripcion}\n👉 Contactá con un asesor: https://wa.me/${menu[claveFinal].asesor}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(claveFinal)}`;
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




