
import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, NewsTopic } from "../types";

export class GeminiService {
  /**
   * Generuje newsletter pomocou modelu gemini-3-pro-preview.
   * Premenná prostredia musí byť nastavená ako API_KEY.
   */
  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is missing. In Vercel, please ensure you have set the API_KEY environment variable and triggered a Redeploy.");
    }
    
    // Inicializácia presne podľa SDK smerníc
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const topicsFormatted = topics
      .filter(t => t.notes.trim())
      .map((t, i) => `[ITEM ${i + 1}]\n${t.notes}`)
      .join('\n\n---\n\n');

    const prompt = `
      You are the Senior Technical Editor for DASE Analytics. Your goal is to convert rough notes into a high-quality monthly newsletter titled 'DASE NEWS Architect'.
      
      TARGET LANGUAGE: ${language}
      
      DASE STYLE GUIDELINES:
      - TONE: ${styleProfile.tone}
      - KEY VOCABULARY: ${styleProfile.vocabulary.join(', ')}
      - SUMMARY OF STYLE: ${styleProfile.summary}
      
      OUTPUT FORMAT (CRITICAL):
      1. Start with a single "# [Main Title]" (H1).
      2. For each news item:
         - Use "## [Topic Title]" (H2).
         - Write 2-3 paragraphs.
         - End with: "Viac na: [URL]"
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          temperature: 0.8,
          topP: 0.95
        }
      });
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }

  async learnStyle(
    originalDraft: string, 
    editedVersion: string, 
    currentProfile: StyleProfile
  ): Promise<StyleProfile> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY missing");
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze the differences between the 'AI Draft' and the 'User Final Version' for 'DASE NEWS Architect'.
      Refine the 'Style Profile' to better match the user's voice.
      
      AI DRAFT: ${originalDraft}
      USER FINAL VERSION: ${editedVersion}
      CURRENT PROFILE: ${JSON.stringify(currentProfile)}
      
      Return a refined JSON profile.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              vocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING },
              structure: { type: Type.STRING },
            },
            required: ["summary", "vocabulary", "tone", "structure"]
          }
        }
      });

      const updated = JSON.parse(response.text || "{}");
      return {
        ...updated,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Learn Style Error:", error);
      return currentProfile;
    }
  }
}
