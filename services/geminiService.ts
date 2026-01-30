
import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, NewsTopic } from "../types";

export class GeminiService {
  /**
   * Generates a newsletter based on topics and a style profile.
   * Uses gemini-3-pro-preview for high-quality text generation.
   */
  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    // Re-initialize for every call to ensure the latest API_KEY is used.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is not defined in process.env. Please check your deployment settings.");
    }
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
          temperature: 0.75,
          topP: 0.95,
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster text responses
        }
      });
      return response.text || "";
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw error;
    }
  }

  /**
   * Refines the style profile based on user edits.
   */
  async learnStyle(
    originalDraft: string, 
    editedVersion: string, 
    currentProfile: StyleProfile
  ): Promise<StyleProfile> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is not defined in process.env.");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Analyze the differences between the 'AI Draft' and the 'User Final Version' for 'DASE NEWS Architect'.
      Refine the 'Style Profile' to better match the user's personal voice, vocabulary preferences, and formatting nuances.
      
      AI DRAFT:
      ${originalDraft}
      
      USER FINAL VERSION:
      ${editedVersion}
      
      CURRENT PROFILE:
      ${JSON.stringify(currentProfile)}
      
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
