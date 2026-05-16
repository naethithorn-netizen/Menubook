const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

async function callGemini(apiKey, parts, maxTokens, modelIndex = 0) {
  if (modelIndex >= MODELS.length) {
    throw new Error("All models rate limited. Please wait 1 minute and try again.");
  }

  const model = MODELS[modelIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: maxTokens || 1000 },
    }),
  });

  // ถ้า rate limit → ลอง model ถัดไปเลย
  if (response.status === 429) {
    console.log(`${model} rate limited, trying next model...`);
    await new Promise((r) => setTimeout(r, 1000));
    return callGemini(apiKey, parts, maxTokens, modelIndex + 1);
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data.error?.message || "Gemini API error";
    throw new Error(msg);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("AI ไม่ได้ส่งผลลัพธ์กลับมา");

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

    // แปลง response กลับเป็น Anthropic format
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("AI error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
