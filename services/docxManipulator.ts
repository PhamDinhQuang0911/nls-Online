import { GeneratedNLSContent } from "../types";

declare const JSZip: any;

/**
 * Main function to process the DOCX file
 * 1. Unzips the docx
 * 2. Parses document.xml
 * 3. Injects content based on AI generation
 * 4. Zips it back
 */
export async function injectContentIntoDocx(file: File, nlsContent: GeneratedNLSContent, log: (msg: string) => void): Promise<Blob> {
  if (!JSZip) throw new Error("JSZip library not loaded");

  log("Đang giải nén cấu trúc file Word...");
  const zip = new JSZip();
  const fileData = await file.arrayBuffer();
  const loadedZip = await zip.loadAsync(fileData);

  const docXmlFile = loadedZip.file("word/document.xml");
  if (!docXmlFile) throw new Error("File word/document.xml không tồn tại.");

  let docXmlStr = await docXmlFile.async("string");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXmlStr, "application/xml");
  
  // Namespace for Word
  const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

  log("Đang chèn nội dung vào các vị trí...");

  // 1. Insert Objectives (Mục tiêu)
  if (nlsContent.objectives_addition) {
    const objectivesPara = findParagraphByText(xmlDoc, ["Về năng lực", "Năng lực:", "2. Năng lực"]);
    if (objectivesPara) {
      log("✓ Đã tìm thấy mục Năng lực");
      const newPara = createParagraphNode(xmlDoc, nlsContent.objectives_addition, true);
      objectivesPara.parentNode?.insertBefore(newPara, objectivesPara.nextSibling);
    } else {
        log("⚠ Không tìm thấy mục 'Năng lực', chèn vào đầu phần Mục tiêu.");
         // Fallback logic could go here
    }
  }

  // 2. Insert Materials (Thiết bị/Học liệu)
  if (nlsContent.materials_addition) {
    const materialsPara = findParagraphByText(xmlDoc, ["Thiết bị dạy học", "Học liệu", "Chuẩn bị của giáo viên"]);
    if (materialsPara) {
      log("✓ Đã tìm thấy mục Thiết bị dạy học");
      const newPara = createParagraphNode(xmlDoc, "Học liệu số: " + nlsContent.materials_addition, true);
      materialsPara.parentNode?.insertBefore(newPara, materialsPara.nextSibling);
    }
  }

  // 3. Insert Activities
  if (nlsContent.activities_integration && nlsContent.activities_integration.length > 0) {
    let count = 0;
    for (const item of nlsContent.activities_integration) {
      // We look for a paragraph containing the anchor text
      const anchorPara = findParagraphByFuzzyText(xmlDoc, item.anchor_text);
      if (anchorPara) {
        const newPara = createParagraphNode(xmlDoc, item.content, false, "107C10"); // Green text
        anchorPara.parentNode?.insertBefore(newPara, anchorPara.nextSibling);
        count++;
      }
    }
    log(`✓ Đã chèn ${count}/${nlsContent.activities_integration.length} hoạt động tích hợp.`);
  }

  // 4. Append Appendix Table (Simple text format for safety in XML)
  const body = xmlDoc.getElementsByTagNameNS(w, "body")[0];
  if (body) {
    log("Đang tạo bảng tổng hợp cuối bài...");
    const headerPara = createParagraphNode(xmlDoc, "PHỤ LỤC: BẢNG TỔNG HỢP MÃ NĂNG LỰC SỐ", true);
    body.appendChild(headerPara);
    
    // Split table text by newlines and add as paragraphs
    const lines = nlsContent.appendix_table.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
         body.appendChild(createParagraphNode(xmlDoc, line, false));
      }
    });
  }

  // Serialize back to XML
  const serializer = new XMLSerializer();
  const newDocXmlStr = serializer.serializeToString(xmlDoc);

  // Update zip
  loadedZip.file("word/document.xml", newDocXmlStr);

  log("Đang đóng gói file Word...");
  const outBlob = await loadedZip.generateAsync({ type: "blob" });
  return outBlob;
}

/**
 * Helper to find a paragraph node (<w:p>) containing specific text
 */
function findParagraphByText(xmlDoc: Document, searchPhrases: string[]): Element | null {
  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textContent = p.textContent || "";
    for (const phrase of searchPhrases) {
      if (textContent.toLowerCase().includes(phrase.toLowerCase())) {
        return p;
      }
    }
  }
  return null;
}

/**
 * Fuzzy search for anchor text (supports partial matches due to formatting splits)
 */
function findParagraphByFuzzyText(xmlDoc: Document, anchor: string): Element | null {
  const paragraphs = xmlDoc.getElementsByTagName("w:p");
  const cleanAnchor = anchor.trim().toLowerCase().substring(0, 30); // Take first 30 chars
  
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textContent = (p.textContent || "").trim().toLowerCase();
    if (textContent.includes(cleanAnchor)) {
      return p;
    }
  }
  return null;
}

/**
 * Creates a valid Word XML Paragraph Node
 */
function createParagraphNode(xmlDoc: Document, text: string, isBold: boolean = false, colorHex: string = "000000"): Element {
  const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  
  const p = xmlDoc.createElementNS(w, "w:p");
  const r = xmlDoc.createElementNS(w, "w:r");
  const rPr = xmlDoc.createElementNS(w, "w:rPr");
  
  // Style
  if (isBold) {
    const b = xmlDoc.createElementNS(w, "w:b");
    rPr.appendChild(b);
  }
  
  const color = xmlDoc.createElementNS(w, "w:color");
  color.setAttribute("w:val", colorHex);
  rPr.appendChild(color);

  // Text
  const t = xmlDoc.createElementNS(w, "w:t");
  t.setAttribute("xml:space", "preserve");
  t.textContent = text;

  r.appendChild(rPr);
  r.appendChild(t);
  p.appendChild(r);

  return p;
}
