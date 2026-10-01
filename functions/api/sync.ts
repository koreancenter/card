interface Env {
  DB?: any;
  SYNC_KV?: any;
}

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const syncId = url.searchParams.get('id') || '';

  if (!syncId) {
    return new Response(JSON.stringify({ error: 'Missing sync id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (env.DB) {
      const stmt = env.DB.prepare('SELECT cards FROM wallet_sync WHERE sync_id = ?').bind(syncId);
      const row = await stmt.first();
      if (row && row.cards) {
        const cards = typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;
        return new Response(JSON.stringify({ success: true, syncId, cards }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ success: true, syncId, cards: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: true, syncId, cards: [], localOnly: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;

  try {
    const body = await request.json() as any;
    const { syncId, cards } = body || {};

    if (!syncId || !Array.isArray(cards)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      const query = `
        INSERT INTO wallet_sync (sync_id, cards, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(sync_id) DO UPDATE SET
          cards = excluded.cards,
          updated_at = CURRENT_TIMESTAMP
      `;
      await env.DB.prepare(query).bind(syncId, JSON.stringify(cards)).run();
    }

    return new Response(JSON.stringify({ success: true, syncId, count: cards.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    // Return graceful 200 for local-first fallbacks
    return new Response(JSON.stringify({ success: true, localOnly: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
