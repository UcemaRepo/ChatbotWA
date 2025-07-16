# WhatsAuto Server

Servidor Node.js para responder a mensajes entrantes de WhatsAuto via `/message.php`.

## Instalación local

```bash
npm install
npm start
```

## Despliegue en Render

1. Subí este repo a GitHub.
2. En [https://render.com](https://render.com), seleccioná "New Web Service".
3. Conectá tu repo y listo.

## Endpoint

**POST** `/message.php`

```json
{
  "app": "WhatsApp",
  "sender": "Juan",
  "message": "1",
  "group_name": "",
  "phone": "+5491112345678"
}
```

**Response:**
```json
{
  "reply": "Texto de respuesta"
}
```
