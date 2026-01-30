
import { GoogleGenerativeAI } from "@google/generative-ai";
import { StyleProfile, NewsTopic, GoogleGenerativeAI as GoogleGenAIType } from "../types";

export class GeminiService {
  private ai: GoogleGenAIType;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required for GeminiService");
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generuje newsletter pomocou modelu gemini-1.5-pro-latest.
   */
  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    const model = this.ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
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
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
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
    const model = this.ai.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const prompt = `
      Analyze the differences between the 'AI Draft' and the 'User Final Version' for 'DASE NEWS Architect'.
      Refine the 'Style Profile' to better match the user's voice.
      
      AI DRAFT: ${originalDraft}
      USER FINAL VERSION: ${editedVersion}
      CURRENT PROFILE: ${JSON.stringify(currentProfile)}
      
      Return a refined JSON profile in the following structure: { "summary": "...", "vocabulary": ["...", "..."], "tone": "...", "structure": "..." }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const updated = JSON.parse(response.text());
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
