export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { messages, max_tokens } = req.body;
    const lastMessage = messages[messages.length - 1];

    // แปลง Anthropic format → Gemini format
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

    const geminiBody = {
      contents: [{ parts }],
      generationConfig: { maxOutputTokens: max_tokens || 1000 },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // แปลง Gemini response → Anthropic format (ให้ App.jsx ใช้ได้เหมือนเดิม)
    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to call Gemini AI" });
  }
}
