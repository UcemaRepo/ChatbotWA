const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let menu = JSON.parse(fs.readFileSync('menu.json', 'utf8'));

app.post('/message.php', (req, res) => {
  const { message } = req.body;
  console.log("📩 Mensaje recibido:", message);

  const clave = (message || "").trim();
  const respuesta = menu[clave] || menu["default"];

  res.json({ reply: respuesta });
});

app.get("/", (req, res) => {
  res.send("🟢 Servidor WhatsAuto activo");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
