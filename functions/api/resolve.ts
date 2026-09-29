interface Env {
  DB?: any;
}

export const onRequestGet = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const host = (url.searchParams.get('host') || request.headers.get('Host') || '').toLowerCase().replace(/:\d+$/, '');
  const slug = (url.searchParams.get('slug') || '').toLowerCase();

  if (!env.DB) {
    return new Response(JSON.stringify({ notFound: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // If slug is provided directly
    if (slug) {
      const card = await env.DB.prepare('SELECT * FROM cards WHERE slug = ?').bind(slug).first();
      if (card) {
        return new Response(JSON.stringify({ card, matchType: 'slug' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check custom domain lookup
    if (host && host !== 'card.goguma.app' && !host.includes('pages.dev') && !host.includes('localhost')) {
      const card = await env.DB.prepare('SELECT * FROM cards WHERE custom_domain = ?').bind(host).first();
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
