const https = require('https');

module.exports = async function(req, res) {
  const key = process.env.FOOTBALL_API_KEY;

  if (!key) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches',
      {
        headers: {
          'X-Auth-Token': key,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(data);

  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
