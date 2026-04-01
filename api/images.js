export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, per_page = 9, mode = 'search' } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  try {
    const url = mode === 'single'
      ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=portrait`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page}&orientation=portrait`;

    const r = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
