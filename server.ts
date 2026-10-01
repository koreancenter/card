import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

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
