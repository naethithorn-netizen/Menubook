export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. เช็ค API Key
  if (!apiKey) {
    return res.status(200).json({
      status: "❌ FAIL",
      problem: "ไม่พบ GEMINI_API_KEY ใน Vercel Environment Variables",
      fix: "ไปที่ Vercel → Settings → Environment Variables → เพิ่ม GEMINI_API_KEY"
    });
  }

  const keyPreview = apiKey.substring(0, 8) + "..." + apiKey.slice(-4);

  // 2. ทดสอบ Gemini API ด้วย text เท่านั้น (ไม่มีรูป)
  const results = [];
  const MODELS = [
    { name: "gemini-2.0-flash",      version: "v1beta" },
    { name: "gemini-2.0-flash-lite", version: "v1beta" },
    { name: "gemini-1.5-flash",      version: "v1"     },
    { name: "gemini-1.5-flash-8b",   version: "v1"     },
  ];

  for (const { name, version } of MODELS) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ตอบว่า OK เท่านั้น" }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });
      const d = await r.json();
      if (r.ok && d.candidates?.[0]?.content?.parts?.[0]?.text) {
        results.push({ model: name, status: "✅ ใช้งานได้" });
      } else {
        results.push({ model: name, status: "❌ " + (d.error?.message || `HTTP ${r.status}`) });
      }
    } catch (e) {
      results.push({ model: name, status: "❌ " + e.message });
    }
  }

  return res.status(200).json({
    apiKey: keyPreview,
    models: results,
    tip: "ถ้าทุก model ขึ้น ❌ ให้ตรวจสอบ API Key ว่าถูกต้องและมี quota เหลืออยู่"
  });
}
