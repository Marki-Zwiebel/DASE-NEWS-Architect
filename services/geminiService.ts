
import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, NewsTopic } from "../types";

export class GeminiService {
  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    // Priame volanie podľa smerníc SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const topicsFormatted = topics
      .filter(t => t.notes.trim())
      .map((t, i) => `[ITEM ${i + 1}]\n${t.notes}`)
      .join('\n\n---\n\n');

    const prompt = `
      You are the Senior Technical Editor for DASE Analytics. Your goal is to convert rough notes into a high-quality monthly newsletter.
      
      TARGET LANGUAGE: ${language}
      
      DASE STYLE GUIDELINES:
      - TONE: ${styleProfile.tone}
      - KEY VOCABULARY: ${styleProfile.vocabulary.join(', ')}
      - SUMMARY OF STYLE: ${styleProfile.summary}
      
      OUTPUT FORMAT (CRITICAL):
      1. Start with a single "# [Main Title]" (H1). Make it punchy and professional.
      2. For each news item:
         - Use "## [Topic Title]" (H2).
         - Write 2-3 paragraphs. The first should explain what's new. The second should explain "Why this matters for DASE clients".
         - End each item with: "Viac na: [URL]" (use the link provided in the notes).
      3. Use bolding (**word**) sparingly for technical terms.
      
      INPUT NOTES:
      ${topicsFormatted}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          temperature: 0.8,
          topP: 0.9,
        }
      });
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      throw new Error(error?.message || "Chyba pri komunikácii s AI. Skontrolujte API kľúč.");
    }
  }

  async learnStyle(
    originalDraft: string, 
    editedVersion: string, 
    currentProfile: StyleProfile
  ): Promise<StyleProfile> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze the differences between the 'AI Draft' and the 'User Final Version'.
      Refine the 'Style Profile' to better match the user's personal voice, vocabulary preferences, and formatting nuances.
      
      AI DRAFT:
      ${originalDraft}
      
      USER FINAL VERSION:
      ${editedVersion}
      
      CURRENT PROFILE:
      ${JSON.stringify(currentProfile)}
      
      Return a refined JSON profile.
    `;

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
  }
}
