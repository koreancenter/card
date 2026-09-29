export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. API: /api/resolve
    if (url.pathname === "/api/resolve") {
      const slug = url.searchParams.get("slug");
      const host = url.searchParams.get("host");

      try {
        let query = "SELECT * FROM cards WHERE slug = ? LIMIT 1";
        let param = slug || "mrpark";

        if (host && !host.includes("card.goguma.app")) {
          query = "SELECT * FROM cards WHERE custom_domain = ? LIMIT 1";
          param = host;
        }

        const card = await env.DB.prepare(query).bind(param).first();

        if (!card) {
          return new Response(JSON.stringify({ success: false, message: "Card not found" }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        return new Response(JSON.stringify({ success: true, card }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. API: /api/cards (저장)
    if (url.pathname === "/api/cards" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { id, slug, custom_domain, owner_email, theme, data } = body;

        await env.DB.prepare(`
          INSERT INTO cards (id, slug, custom_domain, owner_email, theme, data, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            slug = excluded.slug,
            custom_domain = excluded.custom_domain,
            owner_email = excluded.owner_email,
            theme = excluded.theme,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          id || crypto.randomUUID(),
          slug,
          custom_domain || null,
          owner_email || null,
          theme || "sand",
          typeof data === "string" ? data : JSON.stringify(data)
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 3. 그 외 프론트엔드 정적 파일(SPA 번들) 서빙
    return env.ASSETS.fetch(request);
  }
};