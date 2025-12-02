import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

// Initialize the client. 
// NOTE: We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEntry = async (text: string): Promise<AIAnalysis> => {
  if (!text || text.length < 10) {
    throw new Error("Entry too short to analyze");
  }

  const modelId = "gemini-2.5-flash"; // Efficient for text analysis

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Analyze the following journal entry written by a user.
      Provide a response in JSON format containing:
      - summary: A 1-sentence summary of the entry.
      - sentiment: The overall emotional tone (e.g., Hopeful, Anxious, Joyful).
      - advice: A brief, supportive piece of advice or a relevant stoic/philosophical quote based on the content.
      - keywords: An array of 3-5 tags representing the themes.

      Journal Entry:
      "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            advice: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "sentiment", "advice", "keywords"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text) as AIAnalysis;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze journal entry.");
  }
};
