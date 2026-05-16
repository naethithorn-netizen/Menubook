// แต่ละ model ใช้ API version ต่างกัน
const MODELS = [
  { name: "gemini-2.0-flash",      version: "v1beta" },
  { name: "gemini-2.0-flash-lite", version: "v1beta" },
  { name: "gemini-1.5-flash",      version: "v1"     },
  { name: "gemini-1.5-flash-8b",   version: "v1"     },
];

async function callGemini(apiKey, parts, maxTokens, index = 0) {
  if (index >= MODELS.length) {
    throw new Error("AI ไม่ตอบสนองในขณะนี้ — รอ 1 นาทีแล้วลองใหม่");
  }

  const { name, version } = MODELS[index];
  const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: maxTokens || 1000 },
    }),
  });

  const data = await response.json();

  // rate limit หรือ model ไม่รองรับ → ลอง model ถัดไป
  if (response.status === 429 || response.status === 404 || data.error) {
    console.log(`${name} failed (${response.status}), trying next...`);
    await new Promise((r) => setTimeout(r, 800));
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("AI ไม่ส่งผลลัพธ์กลับมา");
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY ยังไม่ได้ตั้งค่าใน Vercel" });
  }

  try {
    const { messages, max_tokens } = req.body;
    const lastMessage = messages[messages.length - 1];

    // แปลง Anthropic format → Gemini parts
    let parts = [];
    if (Array.isArray(lastMessage.content)) {
      for (const item of lastMessage.content) {
        if (item.type === "text") {
          parts.push({ text: item.text });
        } else if (item.type === "image") {
          parts.push({
            inline_data: {
              mime_type: item.source.media_type,
              data: item.source.data,
            },
          });
        }
      }
    } else {
      parts.push({ text: lastMessage.content });
    }

    const text = await callGemini(apiKey, parts, max_tokens);

    // แปลงกลับเป็น Anthropic format
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("AI error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
