module.exports = async function handler(req, res) {
  console.log('[matches] function called');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const key = process.env.FOOTBALL_API_KEY;
  console.log('[matches] key exists:', !!key);

  if (!key) {
    return res.status(500).json({
      error: 'FOOTBALL_API_KEY not set',
      matches: []
    });
  }

  try {
    const r = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': key,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('[matches] API status:', r.status);

    const data = await r.json();

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(data);

  } catch(err) {
    console.error('[matches] error:', err.message);
    return res.status(500).json({
      error: err.message,
      matches: []
    });
  }
};