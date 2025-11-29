import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

export const generateProductDescription = async (name: string, category: string, features: string): Promise<string> => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) return "API Key missing. Please configure your environment.";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Write a compelling, marketing-focused product description for a product named "${name}" in the category "${category}".
      Key features to include: ${features}.
      Keep it under 60 words. Tone: Professional yet exciting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const chatWithShopper = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  products: Product[]
): Promise<string> => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) return "I'm sorry, I can't chat right now (API Key missing).";

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Create a system instruction with the current product catalog
    const productCatalog = products.map(p => `- ${p.name} ($${p.price}): ${p.description}`).join('\n');
    
    const systemInstruction = `
      You are "Xr Ai", a helpful shopping assistant for ShopperzStop.
      Here is our current product catalog:
      ${productCatalog}
      
      Your goal is to help customers find products, compare them, and answer questions.
      Be concise, friendly, and enthusiastic.
      If a user asks about a product not in the catalog, politely say we don't carry it yet.
      Always recommend specific products from the list when relevant.
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my brain right now. Try again later!";
  }
};