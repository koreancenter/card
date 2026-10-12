interface Env {
  DB?: any;
  R2?: any;
}

const SELECT_CARD_BY_SLUG_SQL = 'SELECT * FROM cards WHERE slug = ? LIMIT 1';
const SELECT_CARD_BY_DOMAIN_SQL = 'SELECT * FROM cards WHERE custom_domain = ? LIMIT 1';
const SELECT_RECENT_CARDS_SQL = 'SELECT * FROM cards ORDER BY created_at DESC LIMIT 50';

const UPSERT_CARD_SQL = `
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

// Validation helper for safe identifiers and strings
function sanitizeStringParam(val: unknown, maxLen = 120): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const rawSlug = url.searchParams.get('slug');
  const rawDomain = url.searchParams.get('domain');

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 not bound' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (rawSlug) {
      const slug = sanitizeStringParam(rawSlug, 100);
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Invalid slug parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Enforce strictly prepared statements via .prepare(...).bind(...)
      const stmt = env.DB.prepare(SELECT_CARD_BY_SLUG_SQL).bind(slug);
      const card = await stmt.first();
      return new Response(JSON.stringify({ card }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (rawDomain) {
      const domain = sanitizeStringParam(rawDomain, 255);
      if (!domain) {
        return new Response(JSON.stringify({ error: 'Invalid domain parameter' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Enforce strictly prepared statements via .prepare(...).bind(...)
      const stmt = env.DB.prepare(SELECT_CARD_BY_DOMAIN_SQL).bind(domain);
      const card = await stmt.first();
      return new Response(JSON.stringify({ card }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Static query for list without variable concatenation
    const { results } = await env.DB.prepare(SELECT_RECENT_CARDS_SQL).all();
    return new Response(JSON.stringify({ cards: results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Database query error' }), {
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
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id, slug, custom_domain, theme, category, is_default, data, owner_email, notes } = body;

    const validatedId = sanitizeStringParam(id, 64) || crypto.randomUUID();
    const validatedSlug = sanitizeStringParam(slug, 100);

    if (!validatedSlug) {
      return new Response(JSON.stringify({ error: 'Valid slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validatedCustomDomain = sanitizeStringParam(custom_domain, 255);
    const validatedTheme = sanitizeStringParam(theme, 32) || 'sand';
    const validatedCategory = sanitizeStringParam(category, 64) || '글로벌 네트워크';
    const validatedIsDefault = is_default ? 1 : 0;
    const validatedData = typeof data === 'string' ? data : JSON.stringify(data || {});
    const validatedOwnerEmail = sanitizeStringParam(owner_email, 255);
    const validatedNotes = typeof notes === 'string' ? notes.slice(0, 1000) : null;

    // Enforce strictly parameterized query via .prepare().bind()
    await env.DB.prepare(UPSERT_CARD_SQL)
      .bind(
        validatedId,
        validatedSlug,
        validatedCustomDomain,
        validatedTheme,
        validatedCategory,
        validatedIsDefault,
        validatedData,
        validatedOwnerEmail,
        validatedNotes
      )
      .run();

    return new Response(JSON.stringify({ success: true, slug: validatedSlug }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Database write error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
