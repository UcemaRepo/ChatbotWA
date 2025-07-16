const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

app.post('/message.php', (req, res) => {
  const { message, sender, phone } = req.body;

  // Logging para depuración
  console.log("📩 BODY recibido:", req.body);

  const clave = (message || "").trim().toLowerCase(); // Normalización

  const respuesta = menu[clave] || menu["default"];

  console.log(`🔑 Clave recibida: "${clave}" → Respuesta: "${respuesta}"`);

  res.json({ reply: respuesta });
});

app.get("/", (req, res) => {
  res.send("🟢 Servidor WhatsAuto activo");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
