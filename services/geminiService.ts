import { GoogleGenAI } from "@google/genai";
import { MemoryMessage } from "../types";

export const generateText = async (
  model: string,
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.7,
  history: MemoryMessage[] = []
): Promise<string> => {
  // process.env.API_KEY is replaced by Vite at build time based on .env file configuration
  const API_KEY = process.env.API_KEY;
  
  if(!API_KEY) {
      throw new Error("Missing Gemini API Key. Please add API_KEY to your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // Transform memory history into Gemini Content format
    // Filter out timestamp and ensure structure is correct
    const pastContent = history.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));

    const contents = [
        ...pastContent,
        { role: 'user', parts: [{ text: prompt }] }
    ];

    const response = await ai.models.generateContent({
      model: model,
      contents: contents as any, // Type cast for flexibility with strict generic types
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
      },
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate text from Gemini.");
  }
};