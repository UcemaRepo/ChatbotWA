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

// Estado de navegación de cada usuario
const estadosUsuarios = {};

// Submenús por área
const submenus = {
  "1": ["licenciatura en administracion de empresas", "licenciatura en marketing", "licenciatura en negocios digitales", "licenciatura en analitica de negocios"],
  "2": ["licenciatura en finanzas", "actuario", "contador publico"],
  "3": ["licenciatura en economia", "licenciatura en economia empresarial"],
  "4": ["ingenieria en inteligencia artificial", "ingenieria en informatica"],
  "5": ["licenciatura en ciencias politicas", "licenciatura en relaciones internacionales", "abogacia"],
  "6": ["licenciatura en artes liberales y ciencias"]
};

// Opciones numericas dinámicamente generadas
const generarOpciones = (area) => {
  return submenus[area].map((clave, index) => `${index + 1}️⃣ ${menu[clave].nombre}`).join("\n") + "\n0️⃣ Menú anterior";
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
  const sender = req.body?.sender || 'anonimo';

  // Estado actual del usuario
  if (!estadosUsuarios[sender]) estadosUsuarios[sender] = { menu: "root" };

  const estado = estadosUsuarios[sender];

  if (estado.menu === "root") {
    if (submenus[claveEntrada]) {
      estado.menu = claveEntrada;
      const titulo = Object.keys(submenus)[claveEntrada - 1];
      const opciones = generarOpciones(claveEntrada);
      res.json({ reply: `${menu.default}\n\n${opciones}` });
    } else {
      res.json({ reply: menu.default });
    }
  } else {
    if (claveEntrada === "0") {
      estado.menu = "root";
      res.json({ reply: menu.default });
    } else {
      const index = parseInt(claveEntrada) - 1;
      const claveCarrera = submenus[estado.menu]?.[index];
      if (claveCarrera && menu[claveCarrera]) {
        const respuesta = `${menu[claveCarrera].descripcion}\n👉 Contactá con un asesor: https://wa.me/${menu[claveCarrera].asesor}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(claveCarrera)}`;
        res.json({ reply: respuesta });
      } else {
        res.json({ reply: "Opción inválida. Por favor seleccioná una opción del menú o escribí 0 para volver." });
      }
    }
  }
});

app.get("/", (req, res) => {
  res.send("🟢 Servidor WhatsAuto activo");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});



