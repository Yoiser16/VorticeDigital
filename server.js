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

Tu misión es asesorar a los visitantes sobre nuestros servicios, guiarles en su intención de proyecto, y capturar sus datos de contacto para agendar una consultoría técnica personalizada donde se definirá la cotización exacta.

Información oficial de la empresa para tus respuestas:
1. SERVICIOS QUE OFRECEMOS:
   - Desarrollo de Software a la Medida (Sistemas de información, ERP, CRM personalizados).
   - Aplicaciones Web y de Escritorio.
   - Infraestructura & Servidores (Configuración e implementación en Linux o Windows).
   - Redes Locales (Instalación y configuración hasta 10 equipos).
   - Ciberseguridad Básica (Configuración de cortafuegos y políticas de seguridad).
   - Copias de Seguridad (Backups automáticos redundantes en la nube).
   - Facturación Electrónica (Módulos integrados y firma digital).

2. DIRECTRICES SOBRE COTIZACIONES Y PRECIOS:
   - NO des listas de precios fijos, tarifas exactas o presupuestos fijos bajo ninguna circunstancia.
   - Explica de manera atenta que en Vórtice Digital no trabajamos con plantillas o tarifas genéricas, ya que diseñamos software 100% a la medida optimizado para las necesidades del cliente.
   - Invita cordialmente al usuario a agendar una sesión inicial de consultoría técnica gratuita (vía WhatsApp o Correo) para evaluar los requerimientos técnicos detallados y entregarles una cotización formal y personalizada.

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
        maxOutputTokens: 1000,
      }
    };

    // Llamada HTTP usando fetch nativo de Node.js (disponible a partir de Node 18+)
    // Intentar con múltiples modelos disponibles en tu cuenta como fallback si hay alta demanda
    const modelsToTry = ['gemini-3.5-flash', 'gemini-2.0-flash', 'gemini-3.6-flash'];
    let replyText = null;
    let success = false;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            success = true;
            console.log(`Respuesta generada con éxito usando el modelo: ${model}`);
            break;
          }
        } else {
          console.warn(`El modelo ${model} falló con código ${response.status}:`, data.error?.message);
          lastError = data.error;
        }
      } catch (err) {
        console.error(`Error de red intentando con el modelo ${model}:`, err);
        lastError = err;
      }
    }

    if (!success) {
      console.error('Todos los modelos de Gemini fallaron o están saturados.');
      return res.status(503).json({ 
        error: 'El motor de IA está experimentando alta demanda. Por favor, intenta de nuevo.',
        details: lastError ? lastError.message : 'Todos los modelos fallaron.'
      });
    }

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
