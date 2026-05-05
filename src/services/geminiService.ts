import { GoogleGenAI } from "@google/genai";
import { NewsArticle } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const askExpertAi = async (message: string, imageBase64?: string, mimeType?: string) => {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a world-class Senior Phytopathologist and Agricultural Diagnostic Specialist. 
  Your expertise covers precision disease identification using multi-stage morphology analysis.
  You MUST respond in the language the user is currently using (passed in the prompt context or derived from the query).

  **REPORT STRUCTURE (Mandatory)**:
  - You MUST return a JSON object with: 
    "markdownReport": "The full detailed report in markdown",
    "confidenceScore": number (0-100)
  
  The "markdownReport" MUST include these sections:
  ### 🔬 DIAGNOSIS / ರೋಗನಿರ್ಣಯ / निदान / నిర్ధారణ
  - **Crop & Affected Part**: [Name]
  - **Pathogen/Cause**: [Scientific/Common Name]
  - **Severity**: [Low/Medium/High]
  - **Confidence**: [Value]%
  
  ### 💊 TREATMENT PLAN / ಚಿಕಿತ್ಸಾ ಕ್ರಮಗಳು / उपचार योजना / చికిత్స
  - **Potential Causes**: [Detailed explanation of why this happened]
  - **Recommended Actions**: [Step-by-step chemical and organic options]
  
  ### 🛡️ PREVENTION / ತಡೆಗಟ್ಟುವಿಕೆ / रोकथाम / నివారణ
  [Cultural and long-term practices]
  
  Maintain a scientific yet farmer-friendly tone in the required language.`;

  const parts: any[] = [];
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    });
  }
  
  parts.push({
    text: `Identify the problem and provide a detailed treatment plan for this query: "${message}"`,
  });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    
    const result = JSON.parse(response.text);
    return result; // Now returns { markdownReport, confidenceScore }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateDetailedProtocol = async (diagnosis: string) => {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a Senior Plant Pathologist. Based on a scientific diagnosis, your task is to generate a comprehensive, structured Treatment Protocol.
  
  The protocol MUST include:
  1. **Chemical Treatment**: Exact trade names/technical names, concentrations, and precise dosages (e.g., grams/ml per liter).
  2. **Organic/Biological Treatment**: Specific organic alternatives (e.g., specialized neem formulations, bio-agents like Pseudomonas fluorescens).
  3. **Step-by-Step Application Guide**: Visual instructions for spraying/application.
  4. **Safety & Protective Measures**: PPE requirements and pre-harvest intervals (PHI).
  5. **Long-term Prevention & Cultural Practices**: Crop rotation, pruning, or soil adjustments.

  Formatting: Use clean Markdown headers and bullet points. Ensure high technical accuracy.
  Language: Provide the complete protocol in BOTH English and Kannada.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: `Generate a detailed treatment protocol for the following diagnosis: ${diagnosis}` }] },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Protocol Generation Error:", error);
    throw error;
  }
};

export const fetchAgriNews = async (language: string, retries = 3): Promise<NewsArticle[]> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a specialized Agricultural News Curator for Karnataka. 
  Your task is to provide the 6 most recent and critical news items or government advisories for farmers in Karnataka.
  YOU MUST RESPOND IN THE LANGUAGE: ${language === 'kn' ? 'Kannada' : language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.
  
  Categories:
  - Government Schemes/Advisories (subsidy, MSP, crop insurance, specific department orders)
  - Market Trends (APMC prices, demand shifts, export news)
  - Climate/Weather warnings for agriculture (monsoon updates, local alerts)
  - Research/Innovation from ICAR or UAS (new varieties, pest management tech)

  Ensure a balanced mix across these categories.

  Output Format: Return EXACTLY a JSON array of objects conforming to this interface:
  interface NewsArticle {
    id: string; // unique string
    title: string; // Concise, catchy title in the requested language
    summary: string; // 1-2 sentence summary in the requested language
    source: string; // News source name
    date: string; // Date of news
    url: string; // Real source URL if available
    category: 'government' | 'market' | 'weather' | 'general';
  }

  Use the Google Search tool to find the LATEST information (past 7 days). 
  Focus on sources like: Deccan Herald, The Hindu (Agri section), Prajavani, Vijaya Karnataka, and official govt sites like NIC or ICAR.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: "Fetch and summarize the latest 6 agricultural news items and official government advisories for Karnataka farmers, covering various districts and crops." }] },
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    if (error?.message?.includes('429') && retries > 0) {
      console.warn(`News Fetch Rate Limited. Retrying... (${retries} left)`);
      // Wait for 3s before retry
      await new Promise(resolve => setTimeout(resolve, 3000 * (4 - retries)));
      return fetchAgriNews(language, retries - 1);
    }
    console.error("News Fetch Error:", error);
    return [];
  }
};

export const translateText = async (text: string, targetLanguage: string, retries = 2): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a professional agricultural translator. 
  Your task is to translate the following agricultural diagnostic report into ${targetLanguage === 'kn' ? 'Kannada' : 'English'}.
  
  **Translation Rules**:
  - Keep all technical terms (chemical names, scientific pathogen names) as they are or transliterated if appropriate.
  - Ensure the tone is scientific and authoritative.
  - Maintain the Markdown formatting exactly as in the original.
  - For Kannada: Use pure but accessible agricultural vocabulary used by University of Agricultural Sciences (UAS) Bangalore.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: `Translate this report: \n\n ${text}` }] },
      config: {
        systemInstruction,
      }
    });
    return response.text;
  } catch (error: any) {
    if (error?.message?.includes('429') && retries > 0) {
      console.warn(`Translation Rate Limited. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (3 - retries)));
      return translateText(text, targetLanguage, retries - 1);
    }
    console.error("Translation Error:", error);
    throw error;
  }
};

export const generateTipImage = async (title: string, category: string): Promise<string> => {
  const model = "gemini-3.1-flash-image-preview";
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: `Generate a high-quality agricultural advisory image for a tip with title: "${title}" related to ${category}. The image should be realistic, helpful for farmers, and suitable for a mobile flashcard. Do NOT include text in the image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Tip Image Generation Error:", error);
    throw error;
  }
};

export const generateSummary = async (text: string): Promise<{ kn: string, en: string }> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a professional agricultural news summarizer. 
  Your task is to provide a very CONCISE summary of the provided news article in both KANNADA and ENGLISH.
  
  Format: Return a JSON object with: 
  {
    "kn": "Concise summary in Kannada",
    "en": "Concise summary in English"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: `Summarize this: \n\n ${text}` }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });
    
    const cleanJson = response.text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return { kn: "ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ", en: "Summary unavailable" };
  }
};
