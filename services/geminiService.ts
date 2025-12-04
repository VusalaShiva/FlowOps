import { GoogleGenAI } from "@google/genai";
import { MemoryMessage } from "../types";

export const generateText = async (
  model: string,
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.7,
  history: MemoryMessage[] = []
): Promise<string> => {
  let API_KEY = '';
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        API_KEY = process.env.API_KEY;
    }
  } catch(e) {}
  
  if(!API_KEY) {
      throw new Error("Missing Gemini API Key. Please configure process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    // Transform memory history into Gemini Content format
    // Filter out timestamp and ensure structure is correct
    const pastContent = history.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));

    // For single turn or chat, we can use generateContent.
    // However, if history exists, we should technically consider it a chat.
    // The @google/genai SDK v1.30 unified generateContent can handle history if passed manually 
    // or we can use `contents` array with multiple turns.

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