export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ status: "❌ ไม่พบ GEMINI_API_KEY", fix: "Vercel → Settings → Environment Variables" });

  const MODELS = ["gemini-2.0-flash","gemini-2.0-flash-lite","gemini-1.5-flash","gemini-1.5-flash-8b"];
  const results = [];

  for (const name of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${name}:generateContent?key=${apiKey}`;
    try {
      const r = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ contents:[{ parts:[{ text:"ตอบว่า OK" }] }], generationConfig:{ maxOutputTokens:5 } }) });
      const d = await r.json();
      const ok = r.ok && d.candidates?.[0]?.content?.parts?.[0]?.text;
      results.push({ model: name, status: ok ? "✅ ใช้งานได้" : "❌ " + (d.error?.message?.substring(0,80) || `HTTP ${r.status}`) });
    } catch(e) {
      results.push({ model: name, status: "❌ " + e.message });
    }
  }

  return res.status(200).json({ apiKey: apiKey.substring(0,8)+"..."+apiKey.slice(-4), models: results });
}
