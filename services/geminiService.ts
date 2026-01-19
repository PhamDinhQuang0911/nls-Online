import { GoogleGenAI } from "@google/genai";
import { GeneratedNLSContent } from "../types";

export const generateCompetencyIntegration = async (prompt: string): Promise<GeneratedNLSContent> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key chưa được cấu hình trong biến môi trường (.env)");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        // Removed responseMimeType: "application/json" to allow free text format
      }
    });

    if (response.text) {
      return parseStructuredResponse(response.text);
    } else {
      throw new Error("Không nhận được phản hồi từ Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Lỗi khi gọi Gemini API: ${error.message || error}`);
  }
};

/**
 * Parses the custom delimited text format into the GeneratedNLSContent object
 */
function parseStructuredResponse(text: string): GeneratedNLSContent {
  const result: GeneratedNLSContent = {
    objectives_addition: "",
    materials_addition: "",
    activities_integration: [],
    appendix_table: ""
  };

  // 1. Parse Objectives
  const objectivesMatch = text.match(/===BAT_DAU_MUC_TIEU===([\s\S]*?)===KET_THUC_MUC_TIEU===/);
  if (objectivesMatch && objectivesMatch[1]) {
    result.objectives_addition = objectivesMatch[1].trim();
  }

  // 2. Parse Materials
  const materialsMatch = text.match(/===BAT_DAU_HOC_LIEU===([\s\S]*?)===KET_THUC_HOC_LIEU===/);
  if (materialsMatch && materialsMatch[1]) {
    result.materials_addition = materialsMatch[1].trim();
  }

  // 3. Parse Appendix
  const appendixMatch = text.match(/===BAT_DAU_PHU_LUC===([\s\S]*?)===KET_THUC_PHU_LUC===/);
  if (appendixMatch && appendixMatch[1]) {
    result.appendix_table = appendixMatch[1].trim();
  }

  // 4. Parse Activities (Complex)
  const activitiesBlockMatch = text.match(/===BAT_DAU_HOAT_DONG===([\s\S]*?)===KET_THUC_HOAT_DONG===/);
  if (activitiesBlockMatch && activitiesBlockMatch[1]) {
    const rawActivities = activitiesBlockMatch[1].split('---PHAN_CACH_HOAT_DONG---');
    
    rawActivities.forEach(block => {
      const anchorMatch = block.match(/ANCHOR:\s*([\s\S]*?)(?=CONTENT:|$)/);
      const contentMatch = block.match(/CONTENT:\s*([\s\S]*?)$/);

      if (anchorMatch && anchorMatch[1] && contentMatch && contentMatch[1]) {
        result.activities_integration.push({
          anchor_text: anchorMatch[1].trim(),
          content: contentMatch[1].trim()
        });
      }
    });
  }

  return result;
}
