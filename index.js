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

  // Control tiempo: resetear si pasó más de 1 hora sin mensaje
  const ahora = Date.now();
  if (!estadosUsuarios[sender]) {
    estadosUsuarios[sender] = { menu: "root", lastTimestamp: ahora };
  } else {
    const diffSegundos = (ahora - estadosUsuarios[sender].lastTimestamp) / 1000;
    if (diffSegundos > 3600) {
      // Resetear estado
      estadosUsuarios[sender] = { menu: "root", lastTimestamp: ahora };
      // Responder con mensaje inicial y salir
      return res.json({ reply: menu.default });
    }
  }
  // Actualizar timestamp
  estadosUsuarios[sender].lastTimestamp = ahora;

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
    const carrera = menu[claveCarrera];
    const asesor = menu.asesores?.[carrera.asesor];
    const contacto = asesor?.telefono
      ? `👉 Contactá con ${asesor.nombre}, tu asesor/a: https://wa.me/${asesor.telefono}?text=Estoy%20interesado%20en%20la%20${encodeURIComponent(carrera.nombre)}`
      : `👉 Un asesor se va a comunicar con vos a la brevedad.`;
    const respuesta = `${carrera.descripcion}\n${contacto}`;
    res.json({ reply: respuesta });
  } else {
    // Entrada inválida dentro del submenú → volver al menú principal
    estado.menu = "root";
    res.json({ reply: menu.default });
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





