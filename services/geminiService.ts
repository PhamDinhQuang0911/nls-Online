import { GoogleGenAI } from "@google/genai";
import { GeneratedNLSContent } from "../types";

// CẬP NHẬT: Thêm tham số apiKey vào hàm
export const generateCompetencyIntegration = async (prompt: string, apiKey: string): Promise<GeneratedNLSContent> => {
  // CẬP NHẬT: Kiểm tra apiKey được truyền vào thay vì process.env
  if (!apiKey) {
    throw new Error("API Key chưa được cung cấp. Vui lòng nhập Key trong phần Cấu hình.");
  }

  // CẬP NHẬT: Khởi tạo AI với key của người dùng
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Khuyên dùng bản 1.5-flash cho ổn định
      contents: prompt,
      config: {
        temperature: 0.5,
        // Removed responseMimeType to allow free text format logic below
      }
    });

    if (response.text) {
      return parseStructuredResponse(response.text);
    } else {
      throw new Error("Không nhận được phản hồi từ Gemini.");
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Xử lý lỗi chi tiết hơn để hiển thị ra giao diện
    const errorMessage = error.message || String(error);
    if (errorMessage.includes("API key not valid")) {
       throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại.");
    }
    throw new Error(`Lỗi khi gọi Gemini API: ${errorMessage}`);
  }
};

/**
 * Parses the custom delimited text format into the GeneratedNLSContent object
 * (Giữ nguyên logic parse cũ của bạn)
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
