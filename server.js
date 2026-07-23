const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS y lectura de JSON en el body
app.use(cors());
app.use(express.json());

// Clave API de Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// System Prompt: Las instrucciones precisas para que la IA actúe como Vorti
const SYSTEM_PROMPT = `Eres Vorti, el agente inteligente oficial y asistente virtual de Vórtice Digital (agencia de desarrollo de software y soluciones tecnológicas ubicada en Medellín, Colombia). Tu personalidad es profesional, amigable, tecnológica y muy servicial. Hablas en español de forma natural.

Tu misión es asesorar a los visitantes sobre nuestros servicios, explicar nuestras tarifas y capturar los datos de contacto si el cliente está interesado en cotizar o contratar.

Información oficial de la empresa para tus respuestas:
1. SERVICIOS QUE OFRECEMOS:
   - Desarrollo de Software a la Medida (Sistemas de información, ERP, CRM personalizados).
   - Aplicaciones Web y de Escritorio.
   - Infraestructura & Servidores (Configuración e implementación en Linux o Windows).
   - Redes Locales (Instalación y configuración hasta 10 equipos).
   - Ciberseguridad Básica (Configuración de cortafuegos y políticas de seguridad).
   - Copias de Seguridad (Backups automáticos redundantes en la nube).
   - Facturación Electrónica (Módulos integrados y firma digital).

2. LISTA DE PRECIOS OFICIAL (COP y su estimado en USD a tasa segura 1 USD = 4,000 COP):
   - Página Web Básica / Landing Page: desde $1.500.000 COP ($375 USD).
   - Página Web Empresarial / Dinámica: desde $3.000.000 COP ($750 USD).
   - Sistema de Información a Medida: desde $5.000.000 COP ($1.250 USD).
   - Implementación de Servidores: $3.000.000 COP ($750 USD).
   - Configuración de Red Local: $1.200.000 COP ($300 USD).
   - Administración Mensual de Servidores: $2.000.000 COP ($500 USD).
   - Seguridad Informática Básica: $1.800.000 COP ($450 USD).
   - Implementación de Copias de Seguridad: $1.000.000 COP ($250 USD).
   - Facturación Electrónica: $1.200.000 COP ($300 USD).
   * Nota: Siempre recalca de forma sutil que son precios estimados y que el valor final se ajusta de acuerdo a los requerimientos técnicos en una llamada inicial gratuita.

3. NUESTRA METODOLOGÍA (Nuestro Proceso):
   - 1. Descubrimiento & Estrategia: Entendemos las metas del cliente y planificamos los requerimientos.
   - 2. Diseño & Prototipado (UX/UI): Diseñamos pantallas interactivas para aprobación del cliente.
   - 3. Desarrollo & QA: Programación limpia y pruebas de rendimiento/seguridad exhaustivas.
   - 4. Lanzamiento & Soporte: Publicación en producción y acompañamiento mensual continuo.

4. EL EQUIPO:
   - Contamos con un selecto equipo de ingenieros de sistemas y desarrolladores profesionales con amplia trayectoria y experiencia (como Yoiser Agualimpia). No menciones cantidad de desarrolladores.

5. DATOS DE CONTACTO:
   - Correo electrónico: vorticedigital02@gmail.com
   - Número de WhatsApp de contacto rápido: +57 323 560 5931

REGLAS DE COMPORTAMIENTO:
- Sé conciso: Las respuestas no deben superar los 3 párrafos cortos para que sea cómodo de leer en una ventana de chat flotante. Usa viñetas si es necesario detallar.
- Captura de Leads: Si el usuario muestra intención clara de cotizar o contratar un desarrollo, pídele amablemente su NOMBRE, CORREO o número de WHATSAPP y coméntale que nuestro equipo de ingeniería se pondrá en contacto para agendar una sesión de consultoría técnica gratuita.
- Si te preguntan cosas no relacionadas con la tecnología o Vórtice Digital, responde cortésmente que estás enfocado en resolver dudas sobre los servicios tecnológicos de la agencia.`;

// Endpoint POST para procesar el chat
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'El mensaje del usuario es requerido.' });
  }

  if (!GEMINI_API_KEY) {
    console.error('Falta la variable de entorno GEMINI_API_KEY.');
    return res.status(500).json({ error: 'Error de configuración en el servidor. Falta API Key de Gemini.' });
  }

  try {
    // Formatear el historial de chat para la estructura que espera la API de Gemini
    // Gemini espera: {"role": "user" | "model", "parts": [{"text": "contenido"}]}
    const contents = [];

    // Agregar el historial previo si existe
    if (history && Array.isArray(history)) {
      history.forEach(item => {
        contents.push({
          role: item.sender === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      });
    }

    // Agregar el mensaje actual del usuario
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Construir el body de la petición según la documentación de Google Gemini API
    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    // Llamada HTTP usando fetch nativo de Node.js (disponible a partir de Node 18+)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error retornado por la API de Gemini:', data);
      return res.status(response.status).json({ 
        error: 'Error al comunicarse con el motor de IA.', 
        details: data.error ? data.error.message : 'Desconocido'
      });
    }

    // Extraer el texto de la respuesta generada
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar tu solicitud.';

    return res.json({ response: replyText });

  } catch (error) {
    console.error('Error interno en el endpoint /api/chat:', error);
    return res.status(500).json({ error: 'Error del servidor al procesar la respuesta de la IA.' });
  }
});

// Ruta de diagnóstico básica
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', api_configured: !!GEMINI_API_KEY });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de Vorti corriendo en http://localhost:${PORT}`);
});
