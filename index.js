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

// Submenús por área con las claves que coinciden con tu JSON
const submenus = {
  "1": ["1.1", "1.2", "1.3", "1.4"],       // Negocios
  "2": ["2.1", "2.2", "2.3"],              // Finanzas, riesgo y gestión
  "3": ["3.1", "3.2"],                     // Economía
  "4": ["4.1", "4.2"],                     // Ingeniería y tecnología
  "5": ["5.1", "5.2", "5.3"],              // Sociales
  "6": ["6.1"]                             // BA - Artes Liberales y Ciencias
};

// Función para generar las opciones del submenú dinámicamente
const generarOpciones = (area) => {
  return submenus[area]
    .map((clave, index) => `${index + 1}️⃣ ${menu[clave].nombre}`)
    .join("\n") + "\n0️⃣ Menú anterior";
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
      const opciones = generarOpciones(claveEntrada);
      res.json({ reply: opciones });
    } else {
      // Mostrar el menú inicial
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
        const { nombre, descripcion, asesor } = menu[claveCarrera];
        const respuesta = `📚 *${nombre}*\n\n${descripcion}\n\n🔗 https://wa.me/${asesor}`;
        res.json({ reply: respuesta });
      } else {
        res.json({ reply: "❌ Opción inválida. Por favor seleccioná una opción del menú o escribí 0 para volver." });
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





