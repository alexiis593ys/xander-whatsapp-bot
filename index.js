// index.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Ruta de verificación del webhook (GET)
app.get('/webhook', (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN || 'xander123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Ruta para recibir mensajes (POST)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log('EVENTO RECIBIDO:');
    console.log(JSON.stringify(body, null, 2));

    if (body.object) {
      const entry = body.entry && body.entry[0];
      const changes = entry.changes && entry.changes[0];
      const value = changes.value;
      const messages = value.messages;

      if (messages && messages.length > 0) {
        const from = messages[0].from; // número que envió el mensaje
        const msgBody = messages[0].text.body; // texto recibido

        console.log(`Mensaje recibido de ${from}: ${msgBody}`);

        // Respuesta automática
        await sendWhatsAppMessage(from, `Hola, soy Xander Bot! 😊 Recibí tu mensaje: "${msgBody}"`);
      }
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.sendStatus(500);
  }
});

// Función para enviar mensaje
async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v24.0/${PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: 'whatsapp',
    to: to,
    text: { body: message },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log('Mensaje enviado:', result);
  } catch (err) {
    console.error('Error enviando mensaje:', err);
  }
}

app.listen(PORT, () => {
  console.log(`Bot activo en puerto ${PORT}`);
});
