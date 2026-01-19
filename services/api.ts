
// API Configuration
const PANDOC_API_URL = 'https://pandocserver-production.up.railway.app/convert';

/**
 * Convert Markdown to DOCX using Pandoc API
 * This ensures Tables are real Word Tables and Math is real Word Equations (OMML)
 */
export async function convertMarkdownToDocx(markdown: string): Promise<Blob> {
  try {
    const response = await fetch(PANDOC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown: markdown })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pandoc Server Error: ${response.status} - ${errorText}`);
    }
    
    return await response.blob();
  } catch (error: any) {
    console.error("Docx Conversion Error:", error);
    throw new Error(`Lỗi xuất file Word: ${error.message}`);
  }
}

/**
 * Helper to download Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
