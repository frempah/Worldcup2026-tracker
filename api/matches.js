

module.exports = async function handler(req, res) {
  // CORS headers — allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get key from environment
  const key = process.env.FOOTBALL_API_KEY;

  // Key missing — return helpful error
  if (!key) {
    console.error('[matches] FOOTBALL_API_KEY not set in Vercel environment variables');
    return res.status(200).json({
      error: 'API key not configured',
      matches: [],
      message: 'Add FOOTBALL_API_KEY to Vercel Environment Variables'
    });
  }

  try {
    console.log('[matches] Fetching from football-data.org...');

    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': key,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[matches] API response status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[matches] API error:', response.status, errText);
      return res.status(200).json({
        error: 'API returned ' + response.status,
        matches: []
      });
    }

    const data = await response.json();
    const matchCount = (data.matches || []).length;
    console.log('[matches] Got', matchCount, 'matches');

    // Cache for 5 minutes on CDN
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(data);

  } catch (err) {
    console.error('[matches] Fetch error:', err.message);
    return res.status(200).json({
      error: err.message,
      matches: []
    });
  }
};
