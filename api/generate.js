export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 환경변수 체크
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY가 Vercel 환경변수에 없어요. Vercel 대시보드 → Settings → Environment Variables에서 추가해주세요.' });
  }

  const { systemPrompt, userPrompt } = req.body || {};
  if (!systemPrompt || !userPrompt) {
    return res.status(400).json({ error: '프롬프트가 없어요.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Groq API 오류' });
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: 'Groq 응답이 비어있어요.' });

    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

