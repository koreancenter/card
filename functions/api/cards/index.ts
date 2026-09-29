interface Env {
  DB?: any;
  R2?: any;
}

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const domain = url.searchParams.get('domain');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 not bound' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (slug) {
      const stmt = env.DB.prepare('SELECT * FROM cards WHERE slug = ?').bind(slug);
      const card = await stmt.first();
      return new Response(JSON.stringify({ card }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (domain) {
      const stmt = env.DB.prepare('SELECT * FROM cards WHERE custom_domain = ?').bind(domain);
      const card = await stmt.first();
      return new Response(JSON.stringify({ card }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare('SELECT * FROM cards ORDER BY created_at DESC LIMIT 50').all();
    return new Response(JSON.stringify({ cards: results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: true, localOnly: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json() as any;
    const { id, slug, custom_domain, theme, category, is_default, data, owner_email, notes } = body;

    const query = `
      INSERT INTO cards (id, slug, custom_domain, theme, category, is_default, data, owner_email, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(slug) DO UPDATE SET
        custom_domain = excluded.custom_domain,
        theme = excluded.theme,
        category = excluded.category,
        is_default = excluded.is_default,
        data = excluded.data,
        owner_email = excluded.owner_email,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `;

    await env.DB.prepare(query)
      .bind(
        id,
        slug,
        custom_domain || null,
        theme || 'sand',
        category || '글로벌 네트워크',
        is_default ? 1 : 0,
        typeof data === 'string' ? data : JSON.stringify(data),
        owner_email || null,
        notes || null
      )
      .run();

    return new Response(JSON.stringify({ success: true, slug }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
