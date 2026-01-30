
import { GoogleGenAI, Type } from "@google/genai";
import { StyleProfile, NewsTopic } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateNewsletter(
    topics: NewsTopic[], 
    language: string, 
    styleProfile: StyleProfile
  ): Promise<string> {
    const topicsFormatted = topics
      .filter(t => t.notes.trim())
      .map((t, i) => `TOPIC ${i + 1}:\n${t.notes}`)
      .join('\n\n---\n\n');

    const prompt = `
      Act as a world-class senior copywriter for DASE, a top-tier digital analytics agency. 
      Generate technical news items for our monthly report.
      
      LANGUAGE: ${language}
      
      STYLE PROFILE TO FOLLOW:
      - Summary: ${styleProfile.summary}
      - Tone: ${styleProfile.tone}
      - Key Vocabulary: ${styleProfile.vocabulary.join(', ')}
      
      CRITICAL INSTRUCTIONS:
      1. START with a single catchy and professional main title for the whole article using "# Title" (H1).
      2. DO NOT write any introduction, welcome message, or "perex".
      3. DO NOT write any conclusion, summary, or outro.
      4. ONLY output the main title followed by the news items.
      
      FOR EACH NEWS TOPIC, YOU MUST GENERATE:
      1. A professional and catchy sub-heading (h2 or h3 style using ##).
      2. Exactly 2 to 3 paragraphs of insightful, high-quality content based on the provided notes.
      3. At the end of EACH topic section, add a source link line: "Viac na: [URL]" 
         (Extract the URL from the notes if present, otherwise use a placeholder like "Viac na: [ODKAZ NA ZDROJ]").
      
      INPUT DATA:
      ${topicsFormatted}
      
      TECHNICAL REQUIREMENTS:
      - Ensure technical accuracy (GA4, GTM, BigQuery, Server-side).
      - Maintain a professional, data-driven perspective.
      - If language is Slovak, use professional terminology correctly.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "";
  }

  async learnStyle(
    originalDraft: string, 
    editedVersion: string, 
    currentProfile: StyleProfile
  ): Promise<StyleProfile> {
    const prompt = `
      You are an expert linguistic analyst. I am providing you with an "AI Draft" and a "User-Refined Version".
      
      Your goal is to learn the user's specific writing nuances (how they shorten sentences, what terminology they prefer, their unique flow) and update their Style Profile.
      
      CURRENT STYLE PROFILE:
      ${JSON.stringify(currentProfile, null, 2)}
      
      ORIGINAL AI DRAFT:
      ---
      ${originalDraft}
      ---
      
      USER'S FINAL EDITED VERSION:
      ---
      ${editedVersion}
      ---
      
      TASK:
      Update the Style Profile summary, vocabulary, tone, and structure based ONLY on the user's edits.
      Return the updated Style Profile in JSON format.
    `;

    const response = await this.ai.models.generateContent({
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
