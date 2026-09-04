import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Empathetic Chat endpoint with multi-model fallback and graceful degradation
app.post('/api/chat', async (req, res) => {
  const { messages, context } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const lastUserMsg =
    [...messages].reverse().find((m: { role: string; content: string }) => m.role === 'user')?.content || '';

  const ai = getGenAI();

  // If no API key is set, seamlessly serve tailored empathetic responses
  if (!ai) {
    return res.json({
      reply: getEmpatheticFallbackResponse(lastUserMsg),
      isFallback: true,
    });
  }

  try {
    // Prepare conversation contents for Gemini
    const systemPrompt = `You are Haven, a compassionate, deeply empathetic mental health and emotional wellness companion.
Your primary qualities are:
1. Active, non-judgmental listening and emotional validation. Acknowledge how the user feels before anything else.
2. Warm, gentle, and calming tone. Use soft, grounded language without medical jargon or unsolicited diagnostic labels.
3. Keep responses concise and spacious (2-4 gentle sentences usually, or a short reflective question). Never overwhelm the user with long lectures or generic bulleted lists.
4. If the user mentions feeling stressed, anxious, or overwhelmed, you may gently offer a simple grounding technique (e.g. noticing 3 things around them, or taking a slow deep breath together).
5. If the user expresses gratitude or a positive moment, warmly celebrate and savor that moment with them.
6. Crucial Safety Guardrail: You are a supportive peer companion, not a licensed therapist or crisis service. If the user indicates imminent self-harm, suicidal ideation, or severe crisis, respond with profound care and immediately provide crisis support resources (e.g., "If you are in distress or thinking about self-harm, please reach out right away: Call or text 988 (US & Canada), text HOME to 741741, or visit befrienders.org globally. You do not have to carry this alone.").

${context?.recentMood ? `Context about the user: Their latest logged mood is "${context.recentMood}".` : ''}
${context?.gratitudeCount ? `They have logged ${context.gratitudeCount} gratitude entries so far.` : ''}`;

    // Sanitize conversation history:
    // Gemini contents MUST begin with a 'user' turn and strictly alternate roles
    const sanitizedMessages: Array<{ role: 'user' | 'model'; content: string }> = [];
    for (const msg of messages) {
      if (typeof msg?.content !== 'string' || !msg.content.trim()) continue;
      const role = msg.role === 'user' ? 'user' : 'model';
      // Skip initial model greetings from the contents payload
      if (sanitizedMessages.length === 0 && role !== 'user') {
        continue;
      }
      const last = sanitizedMessages[sanitizedMessages.length - 1];
      if (last && last.role === role) {
        last.content += `\n${msg.content.trim()}`;
      } else {
        sanitizedMessages.push({ role, content: msg.content.trim() });
      }
    }

    if (sanitizedMessages.length === 0 && lastUserMsg) {
      sanitizedMessages.push({ role: 'user', content: lastUserMsg });
    }

    const contents = sanitizedMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    // Attempt primary model, fallback to alternative if high demand / 503 occurs
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let reply = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        if (response.text) {
          reply = response.text.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} encountered an issue, trying next:`, err?.message || err);
        lastError = err;
      }
    }

    if (reply) {
      return res.json({ reply, isFallback: false });
    }

    // If both models were unavailable due to temporary upstream spikes (503/429),
    // deliver a warm fallback without failing the HTTP request with a 500 error
    console.warn('Upstream models unavailable, serving compassionate fallback:', lastError?.message);
    return res.json({
      reply: getEmpatheticFallbackResponse(lastUserMsg),
      isFallback: true,
    });
  } catch (error: any) {
    console.error('Handled chat exception:', error?.message || error);
    return res.json({
      reply: getEmpatheticFallbackResponse(lastUserMsg),
      isFallback: true,
    });
  }
});

function getEmpatheticFallbackResponse(userPrompt: string): string {
  const promptLower = (userPrompt || '').toLowerCase();
  if (promptLower.includes('anxious') || promptLower.includes('stress') || promptLower.includes('overwhelm') || promptLower.includes('panic')) {
    return "I hear how heavy and overwhelming that feels right now. It is completely okay to pause. Drop your shoulders away from your ears, release tension in your jaw, and let's take a slow, gentle breath in together. What is one small, simple thing around you right now that feels safe or grounding?";
  }
  if (promptLower.includes('sad') || promptLower.includes('depress') || promptLower.includes('low') || promptLower.includes('lonely') || promptLower.includes('cry')) {
    return "Thank you for sharing that with me. It takes real courage to acknowledge sadness or loneliness. You don't have to carry this alone, and you don't have to fix everything today. I'm right here with you. What does your mind or heart need most in this moment?";
  }
  if (promptLower.includes('breathe') || promptLower.includes('breath') || promptLower.includes('grounding') || promptLower.includes('calm')) {
    return "Let's take a peaceful moment together. Inhale gently through your nose for 4 counts, hold softly for 4, and exhale slowly for 6. Feel your feet resting firmly on the ground. You are safe in this quiet second.";
  }
  if (promptLower.includes('happy') || promptLower.includes('grateful') || promptLower.includes('good') || promptLower.includes('proud') || promptLower.includes('joy')) {
    return "That brings such genuine warmth to hear! It is so meaningful to pause and truly savor these moments of light. What part of that experience brought you the deepest sense of peace or joy?";
  }
  if (promptLower.includes('tired') || promptLower.includes('exhaust') || promptLower.includes('burnout') || promptLower.includes('sleep')) {
    return "It sounds like your body and mind have been carrying a tremendous load. Rest is not a reward you have to earn—it is a basic human necessity. Give yourself full permission to slow down and rest without guilt today.";
  }
  return "I am here with you, listening with an open heart. Take your time, take a slow gentle breath, and share whatever is present for you right now.";
}

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mental Health Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
