interface Env {
  DB?: any;
}

const SELECT_RESOLVE_SLUG_SQL = 'SELECT * FROM cards WHERE slug = ? LIMIT 1';
const SELECT_RESOLVE_DOMAIN_SQL = 'SELECT * FROM cards WHERE custom_domain = ? LIMIT 1';

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);

  const rawHost = url.searchParams.get('host') || request.headers.get('Host') || '';
  const host = rawHost.toLowerCase().replace(/:\d+$/, '').trim().slice(0, 255);

  const rawSlug = url.searchParams.get('slug') || '';
  const slug = rawSlug.toLowerCase().trim().slice(0, 100);

  if (!env.DB) {
    return new Response(JSON.stringify({ notFound: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. Parameterized slug lookup
    if (slug) {
      const card = await env.DB.prepare(SELECT_RESOLVE_SLUG_SQL).bind(slug).first();
      if (card) {
        return new Response(JSON.stringify({ card, matchType: 'slug' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. Parameterized custom domain lookup
    if (host && host !== 'card.goguma.app' && !host.includes('pages.dev') && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      const card = await env.DB.prepare(SELECT_RESOLVE_DOMAIN_SQL).bind(host).first();
      if (card) {
        return new Response(JSON.stringify({ card, matchType: 'custom_domain' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ notFound: true }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Resolution failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
