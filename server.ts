import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory sync wallet store for local-first peer synchronization
const syncStore: Record<string, any[]> = {};
const cardStore: Record<string, any> = {};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Korean Center Card Studio',
    architecture: 'Zero-AI Local-First & Quiet Luxury Minimalist'
  });
});

// 1. Cross-Device Anonymous Sync Endpoints (/api/sync)
app.get('/api/sync', (req, res) => {
  const syncId = (req.query.id as string) || '';
  if (!syncId) {
    return res.status(400).json({ error: 'Sync ID is required' });
  }

  const cards = syncStore[syncId] || [];
  return res.json({ success: true, syncId, cards });
});

app.post('/api/sync', (req, res) => {
  const { syncId, cards } = req.body;
  if (!syncId || !Array.isArray(cards)) {
    return res.status(400).json({ error: 'Invalid sync payload' });
  }

  syncStore[syncId] = cards;
  // Also index cards by id and slug
  cards.forEach(card => {
    if (card?.id) cardStore[card.id] = card;
    if (card?.slug) cardStore[`slug:${card.slug}`] = card;
  });

  return res.json({ success: true, syncId, count: cards.length });
});

// 2. Card Resolution & Fetch Endpoints (/api/cards)
app.get('/api/cards', (req, res) => {
  const slug = req.query.slug as string;
  const domain = req.query.domain as string;

  if (slug) {
    const card = cardStore[`slug:${slug}`] || Object.values(cardStore).find(c => c?.slug === slug);
    if (card) return res.json({ card });
    return res.status(404).json({ error: 'Card not found for slug' });
  }

  if (domain) {
    const card = Object.values(cardStore).find(c => c?.customDomain === domain);
    if (card) return res.json({ card });
    return res.status(404).json({ error: 'Card not found for custom domain' });
  }

  // Return all cached cards
  const allCards = Object.values(cardStore).filter((v, i, self) => v?.id && self.findIndex(o => o.id === v.id) === i);
  return res.json({ cards: allCards });
});

app.post('/api/cards', (req, res) => {
  const card = req.body;
  if (!card || !card.id) {
    return res.status(400).json({ error: 'Card data with id is required' });
  }

  cardStore[card.id] = card;
  if (card.slug) cardStore[`slug:${card.slug}`] = card;

  return res.json({ success: true, id: card.id, slug: card.slug });
});

// 3. Zero-AI Photo Archiving Graceful Handler
app.post('/api/scan-card', (req, res) => {
  // Pure local-first photo archiving without any external AI token costs or rate limits
  return res.json({
    success: true,
    localOnly: true,
    message: 'Zero-AI Local Photo Archiving Active: 카드 사진이 브라우저 로컬 저장소에 안전하게 보관되었습니다.'
  });
});

// 4. Cloud AI Prompt Helper for Custom HTML / Tailwind Injection
app.post('/api/generate-card-html', async (req, res) => {
  try {
    const { prompt, profileData } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'GEMINI_API_KEY가 서버 환경에 설정되지 않아 클라이언트 프리셋 템플릿 코드를 제공합니다.',
      });
    }

    const ai = new GoogleGenAI({});
    const systemInstruction = `You are a master luxury UI/UX frontend designer specializing in Tailwind CSS (v4) and digital executive identity.
Generate a modern, ultra-high-end digital business card front in Tailwind CSS HTML.
Requirements:
1. The root element must be a single <div class="w-full h-full ..."> filling 100% of the parent container with aspect ratio 90:50 (horizontal) or 50:80 (vertical).
2. Use sophisticated color palettes: sumi ink (#0B0C10), ivory (#F8F4EB), champagne brass (#C5A880), deep forest emerald (#0D1F18), or classic navy (#0A1128).
3. Use fine borders (border border-white/10), clean typography hierarchy, and subtle micro-details (e.g. initials badge, metadata labels).
4. Do NOT output markdown code fences (\`\`\`html or \`\`\`), doctype, html, head, or body tags. Output ONLY the raw HTML string for the card div.`;

    const userPrompt = `Create an ultra-luxury digital business card front HTML with Tailwind CSS.
Prompt / Style Request: ${prompt || '미니멀 샴페인 골드 & 매트 차콜 최고경영자 명함'}
Card Details:
- Name: ${profileData?.name || 'PARK, GIHONG'}
- Company: ${profileData?.company || profileData?.organizationKr || 'GOGUMA AI STUDIO'}
- Title: ${profileData?.title || profileData?.titleKr || 'Principal Master'}
- Phone: ${profileData?.phone || '+82 10-1234-5678'}
- Email: ${profileData?.email || 'master@goguma.app'}
- Website: ${profileData?.website || 'card.goguma.app/master'}
- Address: ${profileData?.address || 'Seoul, Korea'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    let html = response.text || '';
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    return res.json({ success: true, html });
  } catch (error: any) {
    console.error('Gemini card HTML generation error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Generation failed' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
