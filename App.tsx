import React, { useState } from 'react';
import { 
  FileUp, Wand2, FileCheck, Info, Download, 
  BookOpen, Sparkles, Zap, ChevronRight, CheckCircle2, Terminal
} from 'lucide-react';
import { AppState, SubjectType, GradeType } from './types';
import { extractTextFromDocx, createIntegrationTextPrompt } from './utils';
import { generateCompetencyIntegration } from './services/geminiService';
import { injectContentIntoDocx } from './services/docxManipulator';

// --- CẤU HÌNH LOGO ---
// Link ảnh Drive của bạn (Đã thêm cơ chế chống lỗi hiển thị bên dưới)
const LOGO_URL = "https://drive.google.com/uc?export=view&id=1zCnbX2ms0KkfftF20cGpevMQ9NN0GXF1"; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    file: null,
    subject: '',
    grade: '',
    isProcessing: false,
    logs: [],
    config: {
      insertObjectives: true,
      insertMaterials: true,
      insertActivities: true,
      appendTable: true
    },
    result: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setState(prev => ({ 
        ...prev, 
        file, 
        result: null, 
        logs: [`✓ Đã nhận diện file: ${file.name}`] 
      }));
    } else {
        alert("Vui lòng chọn file Word (.docx)");
    }
  };

  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  const handleProcess = async () => {
    if (!state.file || !state.subject || !state.grade) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    setState(prev => ({ 
        ...prev, 
        isProcessing: true, 
        logs: ["🚀 Hệ thống bắt đầu khởi chạy..."] 
    }));

    try {
      addLog(">> Đang đọc cấu trúc file DOCX...");
      const textContext = await extractTextFromDocx(state.file);
      if (!textContext || textContext.length < 50) {
          throw new Error("File quá ngắn hoặc không đọc được nội dung.");
      }

      addLog(">> Đang kết nối AI Teacher Assistant...");
      const prompt = createIntegrationTextPrompt(textContext, state.subject, state.grade);
      
      const generatedContent = await generateCompetencyIntegration(prompt);
      addLog("✓ AI đã thiết kế xong kịch bản Năng lực số.");

      addLog(">> Đang ghép nội dung vào file gốc...");
      const newBlob = await injectContentIntoDocx(state.file, generatedContent, addLog);
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        result: {
            fileName: `NLS_${state.file?.name}`,
            blob: newBlob
        },
        logs: [...prev.logs, "✨ Xử lý hoàn tất 100%."] 
      }));

    } catch (error) {
      addLog(`❌ Lỗi nghiêm trọng: ${error instanceof Error ? error.message : "Unknown error"}`);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-teal-500 selection:text-white pb-20 relative overflow-x-hidden">
      
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/30 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section - ĐÃ ĐỔI TÊN MỚI TẠI ĐÂY */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm">
           <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden border border-slate-100 p-1">
                    {/* Thêm referrerPolicy="no-referrer" để fix lỗi ảnh Drive */}
                    <img 
                      src={LOGO_URL} 
                      alt="Logo" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-icon');
                      }}
                    />
                    <Sparkles className="w-6 h-6 text-teal-600 absolute opacity-0 icon-fallback" />
                    <style>{`.fallback-icon .icon-fallback { opacity: 1; }`}</style>
                </div>
              </div>
              
              <div className="text-center md:text-left">
                {/* TÊN ỨNG DỤNG MỚI */}
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">
                  TÍCH HỢP <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">NĂNG LỰC SỐ</span> TỰ ĐỘNG
                </h1>
                <p className="text-slate-500 font-medium text-sm mt-0.5">Giải pháp soạn giảng thông minh 2025</p>
              </div>
           </div>
           
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100 text-sm font-bold text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              Sẵn sàng hoạt động
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Banner Card */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl"></div>

               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">Thiết lập thông tin</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-teal-100 uppercase tracking-wider ml-1">Môn học</label>
                        <div className="relative">
                          <select 
                            className="w-full p-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl appearance-none focus:bg-white focus:text-slate-800 outline-none transition-all font-medium text-white cursor-pointer"
                            value={state.subject}
                            onChange={(e) => setState(prev => ({...prev, subject: e.target.value as SubjectType}))}
                          >
                            <option value="" className="text-slate-500">-- Chọn môn --</option>
                            <option value="Toán" className="text-slate-800">Toán học</option>
                            <option value="Vật lý" className="text-slate-800">Vật lý</option>
                            <option value="Hóa học" className="text-slate-800">Hóa học</option>
                            <option value="Sinh học" className="text-slate-800">Sinh học</option>
                            <option value="Khoa học tự nhiên" className="text-slate-800">KHTN</option>
                            <option value="Ngữ văn" className="text-slate-800">Ngữ văn</option>
                            <option value="Tiếng Anh" className="text-slate-800">Tiếng Anh</option>
                            <option value="Tin học" className="text-slate-800">Tin học</option>
                            <option value="Lịch sử" className="text-slate-800">Lịch sử</option>
                            <option value="Địa lý" className="text-slate-800">Địa lý</option>
                            <option value="GDCD" className="text-slate-800">GDCD</option>
                          </select>
                          <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-100 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-teal-100 uppercase tracking-wider ml-1">Khối lớp</label>
                        <div className="relative">
                          <select 
                            className="w-full p-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl appearance-none focus:bg-white focus:text-slate-800 outline-none transition-all font-medium text-white cursor-pointer"
                            value={state.grade}
                            onChange={(e) => setState(prev => ({...prev, grade: e.target.value as GradeType}))}
                          >
                            <option value="" className="text-slate-500">-- Chọn khối --</option>
                            <option value="Lớp 6" className="text-slate-800">Lớp 6 (TC1)</option>
                            <option value="Lớp 7" className="text-slate-800">Lớp 7 (TC1)</option>
                            <option value="Lớp 8" className="text-slate-800">Lớp 8 (TC2)</option>
                            <option value="Lớp 9" className="text-slate-800">Lớp 9 (TC2)</option>
                            <option value="Lớp 10" className="text-slate-800">Lớp 10 (NC1)</option>
                            <option value="Lớp 11" className="text-slate-800">Lớp 11 (NC1)</option>
                            <option value="Lớp 12" className="text-slate-800">Lớp 12 (NC1)</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-100 pointer-events-none rotate-90" />
                        </div>
                      </div>
                  </div>

                   <div className="group/upload relative">
                      <input type="file" id="file-upload" accept=".docx" className="hidden" onChange={handleFileChange} />
                      <label 
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                          ${state.file 
                            ? 'bg-white/20 border-white/50 text-white' 
                            : 'bg-white/10 border-white/30 text-teal-50 hover:bg-white/20 hover:border-white'
                          }`}
                      >
                        {state.file ? (
                          <div className="flex items-center gap-3 animate-in fade-in zoom-in">
                            <div className="w-10 h-10 bg-white text-teal-600 rounded-lg flex items-center justify-center">
                               <FileCheck className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                               <p className="font-bold text-white line-clamp-1">{state.file.name}</p>
                               <p className="text-xs text-teal-100">Sẵn sàng xử lý</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover/upload:scale-110 transition-transform">
                              <FileUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white">Tải lên Giáo án (.docx)</p>
                                <p className="text-xs text-teal-100 opacity-80">Hỗ trợ MathType</p>
                            </div>
                          </div>
                        )}
                      </label>
                   </div>
               </div>
            </div>

            <button
              disabled={!state.file || state.isProcessing}
              onClick={handleProcess}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg
                ${!state.file || state.isProcessing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-white text-teal-700 hover:bg-teal-50 border-2 border-teal-100'
                }`}
            >
              {state.isProcessing ? (
                 <>
                    <div className="w-5 h-5 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
                    <span>Đang xử lý...</span>
                 </>
              ) : (
                 <>
                    <Wand2 className="w-5 h-5" />
                    <span>Tích hợp Năng lực số ngay</span>
                 </>
              )}
            </button>

            {state.result && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Thành công!</h3>
                       <p className="text-slate-500 text-sm">File đã sẵn sàng.</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => {
                       if (state.result) {
                          const url = URL.createObjectURL(state.result.blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = state.result.fileName; a.click();
                       }
                    }}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                 >
                    <Download className="w-4 h-4" /> Tải về
                 </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Terminal & Tips */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-[#1e293b] rounded-[2rem] p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[450px] border border-slate-700">
                
                <div className="flex gap-2 mb-4 items-center border-b border-slate-700 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                   <div className="ml-auto flex items-center gap-2 text-slate-400 text-xs font-mono uppercase tracking-widest">
                      <Terminal className="w-3 h-3" /> Console
                   </div>
                </div>
                
                <div className="flex-1 font-mono text-sm overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {state.logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3 opacity-60">
                          <Info className="w-8 h-8" />
                          <p>Waiting for command...</p>
                      </div>
                   ) : (
                      state.logs.map((log, i) => (
                         <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                            <span className="text-teal-400 shrink-0 select-none">$</span>
                            <span className={`${
                               log.includes("Lỗi") ? "text-red-400" : 
                               log.includes("✓") || log.includes("✨") ? "text-emerald-400" : 
                               log.includes(">>") ? "text-blue-300" : "text-slate-300"
                            } break-words`}>
                               {log.replace(">>", "")}
                            </span>
                         </div>
                      ))
                   )}
                   {state.isProcessing && (
                       <div className="flex gap-2 items-center text-teal-500 mt-2 animate-pulse pl-4">
                           <span className="w-2 h-4 bg-teal-500 block"></span>
                       </div>
                   )}
                </div>
             </div>

             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-teal-700">
                    <Info className="w-4 h-4" /> Lưu ý
                </h4>
                <div className="space-y-2">
                   {[
                      "File không được đặt mật khẩu.",
                      "Giữ nguyên công thức MathType & Hình ảnh.",
                      "Nội dung NLS mới có màu đỏ."
                   ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                         <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div>
                         <span>{tip}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
