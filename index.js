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

// Submenús por área usando códigos "X" para área y "X.Y" para carrera
const submenus = {
  "1": {
    "1.1": "administracion de empresas",
    "1.2": "marketing",
    "1.3": "negocios digitales",
    "1.4": "analitica de negocios"
  },
  "2": {
    "2.1": "finanzas",
    "2.2": "actuario",
    "2.3": "contador publico"
  },
  "3": {
    "3.1": "economia",
    "3.2": "economia empresarial"
  },
  "4": {
    "4.1": "ingenieria en inteligencia artificial",
    "4.2": "ingenieria en informatica"
  },
  "5": {
    "5.1": "ciencias politicas",
    "5.2": "relaciones internacionales",
    "5.3": "abogacia"
  },
  "6": {
    "6.1": "ba - artes liberales y ciencias"
  }
};

// Función para generar texto de opciones del submenú con números simples
const generarOpciones = (area) => {
  const opciones = Object.keys(submenus[area])
    .map((codigo, index) => `${index + 1}️⃣ ${menu[submenus[area][codigo]].nombre}`)
    .join("\n");
  return opciones + "\n0️⃣ Menú anterior";
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

  if (!estadosUsuarios[sender]) estadosUsuarios[sender] = { menu: "root" };
  const estado = estadosUsuarios[sender];

  if (estado.menu === "root") {
    // Esperamos respuesta 1..6 para seleccionar área
    if (submenus[claveEntrada]) {
      estado.menu = claveEntrada; // Guardamos área actual
      const opciones = generarOpciones(claveEntrada);
      res.json({ reply: `${menu.default}\n\n${opciones}` });
    } else {
      res.json({ reply: menu.default });
    }
  } else {
    // Estamos en un submenú de área
    if (claveEntrada === "0") {
      estado.menu = "root";
      res.json({ reply: menu.default });
    } else {
      // Convertimos la opción simple a código submenú (ej: "1" -> "1.1", "2" -> "1.2", etc)
      const opcionIndex = parseInt(claveEntrada, 10);
      if (isNaN(opcionIndex)) {
        res.json({ reply: "❌ Opción inválida. Por favor seleccioná una opción del menú o escribí 0 para volver." });
        return;
      }

      const area = estado.menu;
      const keys = Object.keys(submenus[area]);
      const codigoSeleccionado = keys[opcionIndex - 1];
      if (!codigoSeleccionado) {
        res.json({ reply: "❌ Opción inválida. Por favor seleccioná una opción del menú o escribí 0 para volver." });
        return;
      }

      const carreraClave = submenus[area][codigoSeleccionado];
      if (menu[carreraClave]) {
        const { nombre, descripcion, asesor } = menu[carreraClave];
        const respuesta = `📚 *${nombre}*\n\n${descripcion}\n\n🔗 Contactá con un asesor: https://wa.me/${asesor}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(nombre)}`;
        res.json({ reply: respuesta });
      } else {
        res.json({ reply: "❌ Carrera no encontrada. Por favor seleccioná una opción válida." });
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




