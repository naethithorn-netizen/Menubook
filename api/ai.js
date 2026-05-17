// ทุก model ใช้ v1beta เหมือนกันหมด
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.0-pro-vision-latest",
];

async function callGemini(apiKey, parts, maxTokens, index = 0) {
  if (index >= MODELS.length) {
    throw new Error("quota หมดสำหรับวันนี้ — รอพรุ่งนี้ quota จะรีเซ็ตอัตโนมัติ หรือเพิ่ม billing ใน Google AI Studio");
  }

  const name = MODELS[index];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${name}:generateContent?key=${apiKey}`;

  let response, data;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: maxTokens || 1000 },
      }),
    });
    data = await response.json();
  } catch (e) {
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  if (!response.ok || data.error) {
    const msg = data.error?.message || "";
    console.log(`${name} failed: ${msg.substring(0, 80)}`);
    await new Promise((r) => setTimeout(r, 300));
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) return callGemini(apiKey, parts, maxTokens, index + 1);

  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY ยังไม่ได้ตั้งค่าใน Vercel" });

  try {
    const { messages, max_tokens } = req.body;
    const lastMessage = messages[messages.length - 1];

    let parts = [];
    if (Array.isArray(lastMessage.content)) {
      for (const item of lastMessage.content) {
        if (item.type === "text") parts.push({ text: item.text });
        else if (item.type === "image") parts.push({ inline_data: { mime_type: item.source.media_type, data: item.source.data } });
      }
    } else {
      parts.push({ text: String(lastMessage.content) });
    }

    const text = await callGemini(apiKey, parts, max_tokens);
    return res.status(200).json({ content: [{ type: "text", text }] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
