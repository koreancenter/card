export interface Env {
  DB: any;
  R2?: any;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
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
      const slug = url.searchParams.get("slug");
      const host = request.headers.get("host") || "";

      try {
        let card = null;

        // 자체 도메인(직원/대표자 전용)으로 접속한 경우
        if (!host.includes("card.goguma.app") && !host.includes("localhost")) {
          card = await env.DB.prepare(
            "SELECT * FROM cards WHERE custom_domain = ? LIMIT 1"
          ).bind(host).first();
        } 
        // 기본 슬러그로 접속한 경우
        else if (slug) {
          card = await env.DB.prepare(
            "SELECT * FROM cards WHERE slug = ? LIMIT 1"
          ).bind(slug).first();
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
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 2. 단일 명함 등록/수정: POST /api/cards
    if (url.pathname === "/api/cards" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { id, slug, custom_domain, owner_key, theme, data } = body;

        await env.DB.prepare(`
          INSERT INTO cards (id, slug, custom_domain, owner_key, theme, data, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            slug = excluded.slug,
            custom_domain = excluded.custom_domain,
            theme = excluded.theme,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          id || crypto.randomUUID(),
          slug,
          custom_domain || null,
          owner_key || null,
          theme || "sand",
          typeof data === "string" ? data : JSON.stringify(data)
        ).run();

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 3. 무계정 보관함 불러오기: GET /api/sync?id=sync_xxxx
    if (url.pathname === "/api/sync" && request.method === "GET") {
      const syncId = url.searchParams.get("id");
      if (!syncId) {
        return new Response(
          JSON.stringify({ success: false, message: "Sync ID missing" }),
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        const wallet: any = await env.DB.prepare(
          "SELECT cards_json FROM wallets WHERE sync_id = ? LIMIT 1"
        ).bind(syncId).first();

        return new Response(
          JSON.stringify({
            success: true,
            cards: wallet ? JSON.parse(wallet.cards_json) : []
          }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 4. 무계정 보관함 백업/저장: POST /api/sync
    if (url.pathname === "/api/sync" && request.method === "POST") {
      try {
        const { syncId, cards } = await request.json();
        if (!syncId) {
          return new Response(
            JSON.stringify({ success: false, message: "Sync ID missing" }),
            { status: 400, headers: corsHeaders }
          );
        }

        await env.DB.prepare(`
          INSERT INTO wallets (sync_id, cards_json, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(sync_id) DO UPDATE SET
            cards_json = excluded.cards_json,
            updated_at = CURRENT_TIMESTAMP
        `).bind(syncId, JSON.stringify(cards)).run();

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 5. 정적 파일(SPA) 서빙
    return env.ASSETS.fetch(request);
  }
};