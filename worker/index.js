// Cloudflare Worker: EIA oil price caching proxy
// Fetches Brent (RBRTE) and WTI (RWTC) daily spot prices from EIA API v2
// Caches for 6 hours. Returns merged JSON array [{date, brent, wti}, ...]

const EIA_BASE = 'https://api.eia.gov/v2/petroleum/pri/spt/data/';
const CACHE_TTL = 6 * 60 * 60; // 6 hours in seconds
const PAGE_SIZE = 5000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname !== '/prices') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Check Cloudflare Cache API
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const apiKey = env.EIA_API_KEY;
      if (!apiKey) {
        return jsonResponse({ error: 'API key not configured' }, 500);
      }

      // Fetch both series with pagination
      const [brentData, wtiData] = await Promise.all([
        fetchAllPages(apiKey, 'RBRTE'),
        fetchAllPages(apiKey, 'RWTC'),
      ]);

      // Index by date
      const byDate = {};
      for (const row of brentData) {
        byDate[row.period] = { date: row.period, brent: row.value };
      }
      for (const row of wtiData) {
        if (!byDate[row.period]) byDate[row.period] = { date: row.period };
        byDate[row.period].wti = row.value;
      }

      // Sort by date ascending
      const merged = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

      const response = jsonResponse(merged, 200, {
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      });

      // Store in Cloudflare cache
      await cache.put(cacheKey, response.clone());
      return response;
    } catch (err) {
      return jsonResponse({ error: err.message }, 502);
    }
  },
};

async function fetchAllPages(apiKey, seriesId) {
  let all = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams({
      api_key: apiKey,
      'data[0]': 'value',
      frequency: 'daily',
      'facets[series][]': seriesId,
      sort: '[{"column":"period","direction":"asc"}]',
      length: PAGE_SIZE,
      offset: offset,
    });

    const res = await fetch(`${EIA_BASE}?${params}`);
    if (!res.ok) {
      throw new Error(`EIA API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const rows = json.response?.data || [];
    all = all.concat(rows);

    // If we got fewer rows than PAGE_SIZE, we've reached the end
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return all;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}
