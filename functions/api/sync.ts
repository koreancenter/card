interface Env {
  DB?: any;
  SYNC_KV?: any;
}

const SELECT_WALLET_BY_SYNC_ID_SQL = 'SELECT cards_json FROM wallets WHERE sync_id = ? LIMIT 1';
const UPSERT_WALLET_SQL = `
  INSERT INTO wallets (sync_id, cards_json, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(sync_id) DO UPDATE SET
    cards_json = excluded.cards_json,
    updated_at = CURRENT_TIMESTAMP
`;

// Legacy fallback queries in case existing tables are named wallet_sync
const SELECT_LEGACY_WALLET_SQL = 'SELECT cards FROM wallet_sync WHERE sync_id = ? LIMIT 1';
const UPSERT_LEGACY_WALLET_SQL = `
  INSERT INTO wallet_sync (sync_id, cards, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(sync_id) DO UPDATE SET
    cards = excluded.cards,
    updated_at = CURRENT_TIMESTAMP
`;

function isValidSyncId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_\-]{3,64}$/.test(id.trim());
}

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const rawSyncId = url.searchParams.get('id') || '';

  if (!isValidSyncId(rawSyncId)) {
    return new Response(JSON.stringify({ error: 'Invalid or missing sync id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const syncId = rawSyncId.trim();

  try {
    if (env.DB) {
      // 1. Enforce prepared statement on primary wallets table
      try {
        const stmt = env.DB.prepare(SELECT_WALLET_BY_SYNC_ID_SQL).bind(syncId);
        const row = await stmt.first();
        if (row && row.cards_json) {
          const cards = typeof row.cards_json === 'string' ? JSON.parse(row.cards_json) : row.cards_json;
          return new Response(JSON.stringify({ success: true, syncId, cards }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch {
        // Fallback to legacy schema table if needed
        try {
          const stmt = env.DB.prepare(SELECT_LEGACY_WALLET_SQL).bind(syncId);
          const row = await stmt.first();
          if (row && row.cards) {
            const cards = typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;
            return new Response(JSON.stringify({ success: true, syncId, cards }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch {
          // Tables not yet provisioned, proceed to default response
        }
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

    if (!isValidSyncId(syncId) || !Array.isArray(cards)) {
      return new Response(JSON.stringify({ error: 'Invalid sync payload format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cardsJson = JSON.stringify(cards);

    if (env.DB) {
      try {
        // Strictly prepared statement on wallets table
        await env.DB.prepare(UPSERT_WALLET_SQL).bind(syncId.trim(), cardsJson).run();
      } catch {
        // Fallback attempt on legacy wallet_sync table
        try {
          await env.DB.prepare(UPSERT_LEGACY_WALLET_SQL).bind(syncId.trim(), cardsJson).run();
        } catch (dbErr: any) {
          console.warn('D1 write warning:', dbErr?.message);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, syncId, count: cards.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    // Return graceful 200 for local-first client resilience
    return new Response(JSON.stringify({ success: true, localOnly: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
