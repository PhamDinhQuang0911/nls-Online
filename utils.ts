// Declare globals for the libraries loaded via script tags
declare const mammoth: any;

// Hardcoded mapping for simplified level lookup
const LEVEL_MAPPING: Record<string, { ten: string, kyHieu: string, nhiemVu: string }> = {
  "Lớp 1": { ten: "Cơ bản 1", kyHieu: "CB1", nhiemVu: "Nhiệm vụ đơn giản, có hướng dẫn" },
  "Lớp 2": { ten: "Cơ bản 1", kyHieu: "CB1", nhiemVu: "Nhiệm vụ đơn giản, có hướng dẫn" },
  "Lớp 3": { ten: "Cơ bản 2", kyHieu: "CB2", nhiemVu: "Nhiệm vụ đơn giản, tự chủ hơn" },
  "Lớp 4": { ten: "Cơ bản 2", kyHieu: "CB2", nhiemVu: "Nhiệm vụ đơn giản, tự chủ hơn" },
  "Lớp 5": { ten: "Cơ bản 2", kyHieu: "CB2", nhiemVu: "Nhiệm vụ đơn giản, tự chủ hơn" },
  "Lớp 6": { ten: "Trung cấp 1", kyHieu: "TC1", nhiemVu: "Nhiệm vụ xác định rõ ràng, thường xuyên" },
  "Lớp 7": { ten: "Trung cấp 1", kyHieu: "TC1", nhiemVu: "Nhiệm vụ xác định rõ ràng, thường xuyên" },
  "Lớp 8": { ten: "Trung cấp 2", kyHieu: "TC2", nhiemVu: "Nhiệm vụ không thường xuyên, theo nhu cầu cá nhân" },
  "Lớp 9": { ten: "Trung cấp 2", kyHieu: "TC2", nhiemVu: "Nhiệm vụ không thường xuyên, theo nhu cầu cá nhân" },
  "Lớp 10": { ten: "Nâng cao 1", kyHieu: "NC1", nhiemVu: "Nhiệm vụ phức tạp, hướng dẫn người khác" },
  "Lớp 11": { ten: "Nâng cao 1", kyHieu: "NC1", nhiemVu: "Nhiệm vụ phức tạp, hướng dẫn người khác" },
  "Lớp 12": { ten: "Nâng cao 1", kyHieu: "NC1", nhiemVu: "Nhiệm vụ phức tạp, hướng dẫn người khác" },
};

// Condensed Framework Text for AI Context
const KHUNG_NLS_CONTEXT = `
KHUNG NĂNG LỰC SỐ (Tóm tắt cho AI):
1. Khai thác dữ liệu (I):
- 1.1. Tìm kiếm và lọc (TC1: Tìm theo quy trình; TC2: Tổ chức chiến lược tìm kiếm).
- 1.2. Đánh giá dữ liệu (TC1: So sánh độ tin cậy; TC2: Phân tích nguồn tin).
- 1.3. Quản lý dữ liệu (TC1: Lưu trữ có cấu trúc; TC2: Sắp xếp để dễ truy xuất).

2. Giao tiếp và hợp tác (II):
- 2.1. Tương tác (TC1: Tương tác thường xuyên; TC2: Chọn nhiều công cụ phù hợp bối cảnh như Zalo, Padlet, LMS).
- 2.2. Chia sẻ (TC1: Chọn công nghệ phù hợp; TC2: Vận dụng chia sẻ, trích dẫn nguồn).
- 2.3. Trách nhiệm công dân (TC1: Tham gia dịch vụ số; TC2: Đề xuất dịch vụ số).
- 2.4. Hợp tác (TC1: Chọn công cụ hợp tác; TC2: Đồng sáng tạo sản phẩm).
- 2.5. Netiquette (TC1: Ứng xử phù hợp; TC2: Điều chỉnh chiến lược giao tiếp).

3. Sáng tạo nội dung số (III):
- 3.1. Phát triển nội dung (TC1: Tạo định dạng cơ bản Word/PPT; TC2: Tạo đa định dạng Video/Infographic/Podcast).
- 3.2. Tích hợp nội dung (TC1: Sửa đổi cơ bản; TC2: Tích hợp, tạo cái mới độc đáo).
- 3.3. Bản quyền (TC1: Phân biệt giấy phép; TC2: Áp dụng quy định bản quyền).
- 3.4. Lập trình (TC1: Viết lệnh đơn giản; TC2: Hiểu nguyên lý, viết chuỗi lệnh).

4. An toàn (IV): Bảo vệ thiết bị, dữ liệu cá nhân, sức khỏe và môi trường.
5. Giải quyết vấn đề (V):
- 5.1. Vấn đề kỹ thuật (TC1: Xử lý lỗi cơ bản; TC2: Phân tích nguyên nhân lỗi).
- 5.2. Nhu cầu công nghệ (TC1: Chọn công cụ phù hợp; TC2: Tùy chỉnh môi trường số, chọn giải pháp tối ưu).
- 5.3. Sáng tạo công nghệ (TC1: Tạo sản phẩm mới; TC2: Đổi mới quy trình, giải quyết tình huống thực tế).
- 5.4. Lỗ hổng năng lực (TC1: Tìm cơ hội học tập; TC2: Lập kế hoạch tự học).

6. Trí tuệ nhân tạo (VI): Hiểu biết, sử dụng có đạo đức và đánh giá công cụ AI.
`;

export function createIntegrationTextPrompt(keHoachText: string, monHoc: string, khoiLop: string): string {
  const mucDoInfo = LEVEL_MAPPING[khoiLop];
  
  if (!mucDoInfo) {
    throw new Error(`Chưa hỗ trợ ${khoiLop}`);
  }

  return `Bạn là Chuyên gia Sư phạm số và Công nghệ giáo dục. Nhiệm vụ: Tích hợp Năng lực số (NLS) sâu và cụ thể vào giáo án ${monHoc} ${khoiLop}.

Cấp độ NLS áp dụng: ${mucDoInfo.ten} (${mucDoInfo.kyHieu}). Nhiệm vụ: ${mucDoInfo.nhiemVu}.

THAM CHIẾU KHUNG NLS:
${KHUNG_NLS_CONTEXT}

Dưới đây là nội dung giáo án gốc:
"""
${keHoachText.substring(0, 30000)} 
"""

### CHIẾN LƯỢC TÍCH HỢP (THEO MÔN HỌC):
1. **Toán/KHTN:** 
   - Kiểm chứng: Dùng Casio/Excel/GeoGebra kiểm tra kết quả tính tay.
   - Mô phỏng: Dùng PhET/Desmos quan sát hiện tượng/đồ thị.
   - Mã NLS gợi ý: 5.2 (Chọn công cụ), 5.3 (Sáng tạo/Hiểu sâu), 1.2 (Đánh giá dữ liệu).
2. **Xã hội/Nghệ thuật:**
   - Sáng tạo: Canva (Infographic), CapCut (Video), Podcast.
   - Chia sẻ: Padlet, Zalo, Google Drive.
   - Mã NLS gợi ý: 3.1 (Tạo nội dung), 2.2 (Chia sẻ), 2.4 (Hợp tác).
3. **Chung:**
   - Đánh giá: Kahoot, Quizizz, Google Forms.

### YÊU CẦU ĐẦU RA (ĐỊNH DẠNG TEXT THÔ BẮT BUỘC):
Dùng chính xác các thẻ phân cách sau:

===BAT_DAU_MUC_TIEU===
(Viết 3-4 gạch đầu dòng mục tiêu NLS. Cấu trúc: [Mã NLS]: [Hành động cụ thể]. Ví dụ: 5.2.TC2b: Sử dụng GeoGebra để...)
===KET_THUC_MUC_TIEU===

===BAT_DAU_HOC_LIEU===
(Liệt kê thiết bị/phần mềm. Ví dụ: Máy tính cầm tay, Điện thoại, App Desmos, Padlet...)
===KET_THUC_HOC_LIEU===

===BAT_DAU_HOAT_DONG===
(Chọn 2-3 hoạt động tiêu biểu nhất để chèn NLS)

ANCHOR: (Trích dẫn chính xác 1 câu ngắn trong giáo án gốc làm điểm neo)
CONTENT: (Mô tả chi tiết. Bắt đầu bằng **➤ Tích hợp NLS ([Mã]):**. Mô tả rõ: GV yêu cầu gì? HS dùng công cụ gì? Kết quả là gì?)
---PHAN_CACH_HOAT_DONG---
ANCHOR: (Điểm neo 2...)
CONTENT: (Nội dung 2...)
===KET_THUC_HOAT_DONG===

===BAT_DAU_PHU_LUC===
(Tạo Bảng tổng hợp mã năng lực. Trình bày dạng Markdown Table gồm 3 cột: Mã NLS | Yêu cầu cần đạt | Học sinh làm gì (Cụ thể).)
===KET_THUC_PHU_LUC===
`;
}

/**
 * Extracts raw text from Docx using Mammoth
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (!mammoth) {
        reject(new Error('Thư viện Mammoth chưa được tải.'));
        return;
      }
      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then((result: any) => {
          resolve(result.value);
        })
        .catch((err: any) => reject(err));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
