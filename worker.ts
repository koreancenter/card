export interface Env {
  DB: any;
  R2?: any;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

// Static Prepared SQL Statements (Zero string concatenation)
const SQL_SELECT_CARD_BY_DOMAIN = "SELECT * FROM cards WHERE custom_domain = ? LIMIT 1";
const SQL_SELECT_CARD_BY_SLUG = "SELECT * FROM cards WHERE slug = ? LIMIT 1";
const SQL_UPSERT_CARD = `
  INSERT INTO cards (id, slug, custom_domain, owner_key, theme, data, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(id) DO UPDATE SET
    slug = excluded.slug,
    custom_domain = excluded.custom_domain,
    theme = excluded.theme,
    data = excluded.data,
    updated_at = CURRENT_TIMESTAMP
`;
const SQL_SELECT_WALLET = "SELECT cards_json FROM wallets WHERE sync_id = ? LIMIT 1";
const SQL_UPSERT_WALLET = `
  INSERT INTO wallets (sync_id, cards_json, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(sync_id) DO UPDATE SET
    cards_json = excluded.cards_json,
    updated_at = CURRENT_TIMESTAMP
`;

function sanitizeParam(val: unknown, maxLen = 128): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS 기본 헤더
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. 단일 명함 조회: GET /api/resolve?slug=...
    if (url.pathname === "/api/resolve" && request.method === "GET") {
      const rawSlug = url.searchParams.get("slug") || "";
      const rawHost = request.headers.get("host") || "";
      const slug = sanitizeParam(rawSlug, 100);
      const host = sanitizeParam(rawHost.toLowerCase().replace(/:\d+$/, ""), 255);

      try {
        let card = null;

        // 자체 도메인(직원/대표자 전용)으로 접속한 경우 - Prepared statement with .bind()
        if (host && !host.includes("card.goguma.app") && !host.includes("localhost") && !host.includes("127.0.0.1")) {
          card = await env.DB.prepare(SQL_SELECT_CARD_BY_DOMAIN).bind(host).first();
        } 
        // 기본 슬러그로 접속한 경우 - Prepared statement with .bind()
        else if (slug) {
          card = await env.DB.prepare(SQL_SELECT_CARD_BY_SLUG).bind(slug).first();
        }

        if (!card) {
          return new Response(
            JSON.stringify({ success: false, message: "Card not found" }),
            { status: 404, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true, card }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Query failed" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 2. 단일 명함 등록/수정: POST /api/cards
    if (url.pathname === "/api/cards" && request.method === "POST") {
      try {
        const body: any = await request.json();
        if (!body || typeof body !== 'object') {
          return new Response(
            JSON.stringify({ success: false, error: "Invalid payload" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { id, slug, custom_domain, owner_key, theme, data } = body;
        const validId = sanitizeParam(id, 64) || crypto.randomUUID();
        const validSlug = sanitizeParam(slug, 100);

        if (!validSlug) {
          return new Response(
            JSON.stringify({ success: false, error: "Slug is required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const validDomain = sanitizeParam(custom_domain, 255);
        const validOwnerKey = sanitizeParam(owner_key, 128);
        const validTheme = sanitizeParam(theme, 32) || "sand";
        const validData = typeof data === "string" ? data : JSON.stringify(data || {});

        // Enforce strictly prepared statements via .prepare().bind()
        await env.DB.prepare(SQL_UPSERT_CARD).bind(
          validId,
          validSlug,
          validDomain,
          validOwnerKey,
          validTheme,
          validData
        ).run();

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Write failed" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 3. 무계정 보관함 불러오기: GET /api/sync?id=sync_xxxx
    if (url.pathname === "/api/sync" && request.method === "GET") {
      const rawSyncId = url.searchParams.get("id") || "";
      if (!rawSyncId || !/^[a-zA-Z0-9_\-]{3,64}$/.test(rawSyncId)) {
        return new Response(
          JSON.stringify({ success: false, message: "Sync ID invalid or missing" }),
          { status: 400, headers: corsHeaders }
        );
      }

      const syncId = rawSyncId.trim();

      try {
        // Enforce strictly prepared statements via .prepare().bind()
        const wallet: any = await env.DB.prepare(SQL_SELECT_WALLET).bind(syncId).first();

        return new Response(
          JSON.stringify({
            success: true,
            cards: wallet && wallet.cards_json ? JSON.parse(wallet.cards_json) : []
          }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Sync fetch failed" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 4. 무계정 보관함 백업/저장: POST /api/sync
    if (url.pathname === "/api/sync" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { syncId, cards } = body || {};

        if (!syncId || typeof syncId !== 'string' || !/^[a-zA-Z0-9_\-]{3,64}$/.test(syncId) || !Array.isArray(cards)) {
          return new Response(
            JSON.stringify({ success: false, message: "Valid Sync ID and cards array required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        const cardsJson = JSON.stringify(cards);

        // Enforce strictly prepared statements via .prepare().bind()
        await env.DB.prepare(SQL_UPSERT_WALLET).bind(syncId.trim(), cardsJson).run();

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message || "Sync save failed" }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 5. 정적 파일(SPA) 서빙
    return env.ASSETS.fetch(request);
  }
};