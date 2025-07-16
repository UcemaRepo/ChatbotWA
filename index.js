const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

app.post('/message.php', (req, res) => {
  const { message, sender, phone } = req.body;

  const rawMessage = String(message || "");
  const clave = rawMessage.trim().toLowerCase();

  console.log("📩 BODY recibido:", req.body);
  console.log("🧪 RAW:", rawMessage);
  console.log("🧪 BYTES:", Array.from(Buffer.from(rawMessage)));
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
