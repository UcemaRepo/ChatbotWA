const express = require('express');
const getRawBody = require('raw-body');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para capturar el body RAW
app.use(async (req, res, next) => {
  try {
    const raw = await getRawBody(req);
    req.rawText = raw.toString();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cargo menú
const rawMenu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

// Palabras que activan el mensaje inicial
const palabrasInicio = ['hola', 'empezar', 'asesor', 'inicio'];

// Diccionario de números → carreras
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
  const bodyRaw = req.rawText || '';
  const clave = bodyRaw.toLowerCase().trim();

  console.log('Mensaje recibido:', clave);

  // Si es un número válido
  if (opcionesNumericas[clave]) {
    const carrera = opcionesNumericas[clave];
    const datos = rawMenu[carrera];
    const mensaje = `${datos.descripcion}\n\n👉 https://wa.me/${datos.asesor}?text=Estoy+interesado+en+${encodeURIComponent(carrera)}`;
    return res.json({ reply: mensaje });
  }

  // Si contiene palabras clave de inicio
  if (palabrasInicio.some(p => clave.includes(p))) {
    return res.json({ reply: rawMenu.default });
  }

  // Si contiene el nombre de alguna carrera
  for (const carrera of Object.keys(rawMenu)) {
    if (carrera === 'default') continue;
    if (clave.includes(carrera)) {
      const datos = rawMenu[carrera];
      const mensaje = `${datos.descripcion}\n\n👉 https://wa.me/${datos.asesor}?text=Estoy+interesado+en+${encodeURIComponent(carrera)}`;
      return res.json({ reply: mensaje });
    }
  }

  // Si no coincide nada
  return res.json({ reply: rawMenu.default });
});

app.get('/', (req, res) => {
  res.send('🟢 Servidor WhatsAuto activo');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});


