import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini AI client
// NOTE: In a real production app, this key should be handled via a secure backend proxy
// to avoid exposing it in the client-side code.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEmailReply = async (originalEmailContent: string, tone: string = 'professional'): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini.");
    return "Error: API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const prompt = `
      You are an AI assistant for a business. 
      Draft a ${tone} email reply to the following customer message.
      Keep it concise, polite, and helpful. 
      Do not include subject lines or placeholders like [Your Name] unless necessary context is missing.
      
      Customer Message:
      "${originalEmailContent}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate a reply at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating response. Please try again later.";
  }
};

export const summarizeCustomerNotes = async (notes: string): Promise<string> => {
    if (!apiKey) return "API Key Missing";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize the following customer interaction notes into a single bullet point for a CRM log: "${notes}"`
        });
        return response.text || "No summary available.";
    } catch (e) {
        console.error(e);
        return "Error summarizing notes.";
    }
}
