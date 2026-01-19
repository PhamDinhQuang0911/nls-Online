import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { convertMarkdownToDocx, downloadBlob } from '../services/api';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Đã sao chép nội dung vào bộ nhớ tạm!');
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      // Use Pandoc API to convert Markdown to DOCX
      // This handles Tables and LaTeX Math ($...$) correctly
      const blob = await convertMarkdownToDocx(content);
      
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `KeHoachBaiDay_NLS_${date}.docx`);
    } catch (error: any) {
      alert(`Xuất file thất bại: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up mt-8">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-2 text-primary-dark">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Kết quả Tích hợp</h3>
        </div>
        <div className="flex space-x-3">
            <button 
              onClick={handleExportWord}
              disabled={isExporting}
              className={`flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white transition-colors shadow-sm
                ${isExporting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isExporting ? (
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {isExporting ? 'Đang xuất...' : 'Xuất Word (Pandoc)'}
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Sao chép
            </button>
        </div>
      </div>
      
      <div 
        className="p-6 overflow-x-auto max-h-[800px] overflow-y-auto prose prose-sm max-w-none prose-headings:text-primary-dark prose-a:text-primary prose-table:border-collapse prose-table:border prose-table:w-full prose-th:border prose-th:p-2 prose-th:bg-gray-100 prose-td:border prose-td:p-2"
      >
         <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ResultDisplay;