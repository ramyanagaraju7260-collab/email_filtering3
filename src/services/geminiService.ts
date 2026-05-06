import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ClassificationResult {
  label: "Spam" | "Not Spam";
  reason: string;
}

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
- reason: a short explanation

Examples:
Email: "You have won a free lottery! Claim now"
Response: {"label": "Spam", "reason": "Contains spam keywords like 'won', 'free', 'lottery'"}

Email: "Let's have a meeting tomorrow at 10 AM"
Response: {"label": "Not Spam", "reason": "Normal professional communication"}`;

export async function classifyEmail(emailContent: string): Promise<ClassificationResult> {
  if (!emailContent.trim()) {
    throw new Error("Email content cannot be empty.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify this email:\n\n${emailContent}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: {
              type: Type.STRING,
              description: "Whether the email is Spam or Not Spam",
              enum: ["Spam", "Not Spam"]
            },
            reason: {
              type: Type.STRING,
              description: "Short explanation for the classification"
            }
          },
          required: ["label", "reason"]
        }
      }
    });

    const text = response.text.trim();
    return JSON.parse(text) as ClassificationResult;
  } catch (error) {
    console.error("Gemini classification error:", error);
    throw new Error("Failed to classify email. Please try again later.");
  }
}
