import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Groq Setup
  const groqApiKey = process.env.GROQ_API_KEY;

  const SYSTEM_INSTRUCTION = `You are an email classification system.
Your task is to classify the given email as either:
1. Spam
2. Not Spam

Rules:
- If the email contains words like "win", "free", "lottery", "offer", "urgent", "prize", "money", classify it as Spam.
- If the email looks like normal communication (meetings, work, personal messages), classify it as Not Spam.
- Be simple and consistent.

Format your response as a JSON object with two fields:
- label: "Spam" | "Not Spam"
- reason: a short explanation`;

  // API Routes
  app.post("/api/classify", async (req, res) => {
    const { emailContent } = req.body;

    if (!emailContent || !emailContent.trim()) {
      return res.status(400).json({ error: "Email content is required." });
    }

    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ API key is not configured on the server." });
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: `Classify this email:\n\n${emailContent}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("Groq API error:", errorBody);
        return res.status(500).json({ error: "Groq API communication failure." });
      }

      const data: any = await response.json();
      const text = data.choices[0].message.content.trim();
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Groq classification error:", error);
      res.status(500).json({ error: "Failed to classify email." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
