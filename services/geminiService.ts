
import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, NewsTopic } from "../types";

export class GeminiService {
  /**
   * Získava kľúč dynamicky z globálneho objektu, aby sa vyhla build-time prepísaniu.
   */
  private getApiKey(): string {
    // Skúsime prioritne globálny shim z window.process
    const key = (window as any).process?.env?.API_KEY || process.env.API_KEY;
    if (!key) {
      console.error("GeminiService: API_KEY is missing in both window.process and process.env");
    }
    return key || "";
  }

  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
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
      
      INPUT DATA:
      ${topicsFormatted}
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
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  async learnStyle(
    originalDraft: string, 
    editedVersion: string, 
    currentProfile: StyleProfile
  ): Promise<StyleProfile> {
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
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
