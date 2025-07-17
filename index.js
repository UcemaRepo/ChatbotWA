const express = require('express');
const getRawBody = require('raw-body');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para capturar el body RAW antes de parsearlo
app.use(async (req, res, next) => {
  try {
    const raw = await getRawBody(req);
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
  "1": ["1.1", "1.2", "1.3", "1.4"],
  "2": ["2.1", "2.2", "2.3"],
  "3": ["3.1", "3.2"],
  "4": ["4.1", "4.2"],
  "5": ["5.1", "5.2", "5.3"],
  "6": ["6.1"]
};

// Opciones numericas dinámicamente generadas
const generarOpciones = (area) => {
  return submenus[area]
    .map((clave, index) => `${index + 1}️⃣ ${menu[clave]?.nombre || "Carrera desconocida"}`)
    .join("\n") + "\n0️⃣ Menú anterior";
};

app.post('/message.php', (req, res) => {
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
    if (submenus[claveEntrada]) {
      estado.menu = claveEntrada;
      const intro = menu.intro?.[claveEntrada] || '';
      const opciones = generarOpciones(claveEntrada);
      res.json({ reply: `${intro}\n\n${opciones}` });
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
        const respuesta = `${menu[claveCarrera].descripcion}\n👉 Contactá con un asesor: https://wa.me/${menu[claveCarrera].asesor}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(menu[claveCarrera].nombre)}`;
        res.json({ reply: respuesta });
      } else {
        // En submenú pero el número no corresponde
        const opciones = generarOpciones(estado.menu);
        res.json({ reply: `❌ Opción inválida. Por favor elegí una opción del menú.\n\n${opciones}` });
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





