import { GoogleGenAI } from "@google/genai";
import { GeneratedNLSContent } from "../types";

export const generateCompetencyIntegration = async (prompt: string, apiKey: string): Promise<GeneratedNLSContent> => {
  // Kiểm tra Key đầu vào
  if (!apiKey) {
    throw new Error("Chưa nhập API Key. Vui lòng điền Key vào ô cấu hình.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // Sử dụng model flash để nhanh và tiết kiệm quota
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', 
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    if (response.text) {
      return parseStructuredResponse(response.text);
    } else {
      throw new Error("Không nhận được phản hồi từ Gemini (Phản hồi rỗng).");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // --- XỬ LÝ LỖI CHI TIẾT TẠI ĐÂY ---
    const errString = (error.message || String(error)).toLowerCase();

    // 1. Lỗi Quá tải (Overloaded / 503)
    if (errString.includes("overloaded") || errString.includes("503") || errString.includes("service unavailable")) {
        throw new Error("⚠️ HỆ THỐNG QUÁ TẢI (503): Google AI đang bận. Vui lòng đợi 30 giây rồi thử lại!");
    }

    // 2. Lỗi Hết Quota (Quota Exceeded / 429)
    if (errString.includes("quota") || errString.includes("limit") || errString.includes("429") || errString.includes("resource has been exhausted")) {
        throw new Error("⛔ HẾT LƯỢT TRUY VẤN: API Key này đã hết hạn mức trong ngày. Vui lòng nhập API Key khác!");
    }

    // 3. Lỗi Key sai
    if (errString.includes("key not valid") || errString.includes("api key")) {
        throw new Error("❌ KEY KHÔNG HỢP LỆ: Vui lòng kiểm tra lại mã API Key của bạn.");
    }

    // Lỗi khác
    throw new Error(`Lỗi hệ thống: ${error.message || "Không xác định"}`);
  }
};

/**
 * Hàm phân tích cú pháp (Giữ nguyên logic cũ của bạn)
 */
function parseStructuredResponse(text: string): GeneratedNLSContent {
  const result: GeneratedNLSContent = {
    objectives_addition: "",
    materials_addition: "",
    activities_integration: [],
    appendix_table: ""
  };

  const objectivesMatch = text.match(/===BAT_DAU_MUC_TIEU===([\s\S]*?)===KET_THUC_MUC_TIEU===/);
  if (objectivesMatch && objectivesMatch[1]) result.objectives_addition = objectivesMatch[1].trim();

  const materialsMatch = text.match(/===BAT_DAU_HOC_LIEU===([\s\S]*?)===KET_THUC_HOC_LIEU===/);
  if (materialsMatch && materialsMatch[1]) result.materials_addition = materialsMatch[1].trim();

  const appendixMatch = text.match(/===BAT_DAU_PHU_LUC===([\s\S]*?)===KET_THUC_PHU_LUC===/);
  if (appendixMatch && appendixMatch[1]) result.appendix_table = appendixMatch[1].trim();

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
