const MODELS = [
  { name: "gemini-2.0-flash",      version: "v1beta" },
  { name: "gemini-2.0-flash-lite", version: "v1beta" },
  { name: "gemini-1.5-flash",      version: "v1"     },
  { name: "gemini-1.5-flash-8b",   version: "v1"     },
];

async function callGemini(apiKey, parts, maxTokens, index = 0) {
  if (index >= MODELS.length) {
    throw new Error("ทุก model ไม่ตอบสนอง — กรุณารอ 1 นาทีแล้วลองใหม่");
  }

  const { name, version } = MODELS[index];
  const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;

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
  } catch (fetchErr) {
    console.error(`${name} fetch error:`, fetchErr.message);
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  // ถ้า rate limit, model ไม่รองรับ, หรือ error → ลอง model ถัดไป
  if (!response.ok || data.error) {
    const reason = data.error?.message || `HTTP ${response.status}`;
    console.log(`${name} failed: ${reason} → trying next model`);
    await new Promise((r) => setTimeout(r, 500));
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) {
    console.log(`${name} returned empty text → trying next model`);
    return callGemini(apiKey, parts, maxTokens, index + 1);
  }

  console.log(`✅ Success with ${name}`);
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "❌ GEMINI_API_KEY ยังไม่ได้ตั้งค่าใน Vercel Environment Variables" });
  }

  try {
    const { messages, max_tokens } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ error: "No messages provided" });
    }

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
      parts.push({ text: String(lastMessage.content) });
    }

    const text = await callGemini(apiKey, parts, max_tokens);

    // แปลงกลับเป็น Anthropic format
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("Handler error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
