import React, { useState } from 'react';
import { 
  FileUp, Wand2, FileCheck, Info, Download, 
  BookOpen, Sparkles, Zap, ChevronRight, CheckCircle2, Terminal
} from 'lucide-react';
import { AppState, SubjectType, GradeType } from './types';
import { extractTextFromDocx, createIntegrationTextPrompt } from './utils';
import { generateCompetencyIntegration } from './services/geminiService';
import { injectContentIntoDocx } from './services/docxManipulator';

// --- CẤU HÌNH LOGO MỚI ---
// Đã cập nhật link Direct từ Google Drive của bạn
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
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-purple-100 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-300/20 blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
           <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border border-white/60 p-2">
                    {/* LOGO DISPLAY */}
                    <img 
                      src={LOGO_URL} 
                      alt="Logo Trường" 
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-icon');
                      }}
                    />
                    <Sparkles className="w-8 h-8 text-indigo-600 absolute opacity-0 icon-fallback" />
                    <style>{`.fallback-icon .icon-fallback { opacity: 1; }`}</style>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  NLS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">Integrator</span> Pro
                </h1>
                <p className="text-slate-500 font-medium text-base mt-1">Trợ lý AI tích hợp Năng lực số 2025</p>
              </div>
           </div>
           
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white shadow-sm text-sm font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online v3.0
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input & Config */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-2xl shadow-indigo-500/10 transition-all hover:shadow-indigo-500/15 group/card">
               
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Thiết lập bài dạy</h2>
               </div>

               {/* Form Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Môn học</label>
                    <div className="relative group/select">
                      <select 
                        className="w-full p-4 pl-4 pr-10 bg-white border-2 border-slate-100 rounded-2xl appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700 cursor-pointer hover:border-indigo-300"
                        value={state.subject}
                        onChange={(e) => setState(prev => ({...prev, subject: e.target.value as SubjectType}))}
                      >
                        <option value="">-- Chọn môn --</option>
                        <option value="Toán">Toán học</option>
                        <option value="Vật lý">Vật lý</option>
                        <option value="Hóa học">Hóa học</option>
                        <option value="Sinh học">Sinh học</option>
                        <option value="Khoa học tự nhiên">KHTN</option>
                        <option value="Ngữ văn">Ngữ văn</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                        <option value="Tin học">Tin học</option>
                        <option value="Lịch sử">Lịch sử</option>
                        <option value="Địa lý">Địa lý</option>
                        <option value="GDCD">GDCD</option>
                      </select>
                      <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Khối lớp</label>
                    <div className="relative group/select">
                      <select 
                        className="w-full p-4 pl-4 pr-10 bg-white border-2 border-slate-100 rounded-2xl appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700 cursor-pointer hover:border-indigo-300"
                        value={state.grade}
                        onChange={(e) => setState(prev => ({...prev, grade: e.target.value as GradeType}))}
                      >
                        <option value="">-- Chọn khối --</option>
                        <option value="Lớp 6">Lớp 6 (TC1)</option>
                        <option value="Lớp 7">Lớp 7 (TC1)</option>
                        <option value="Lớp 8">Lớp 8 (TC2)</option>
                        <option value="Lớp 9">Lớp 9 (TC2)</option>
                        <option value="Lớp 10">Lớp 10 (NC1)</option>
                        <option value="Lớp 11">Lớp 11 (NC1)</option>
                        <option value="Lớp 12">Lớp 12 (NC1)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90 group-hover/select:text-indigo-500 transition-colors" />
                    </div>
                  </div>
               </div>

               {/* File Upload Area */}
               <div className="group/upload relative">
                  <input 
                    type="file" 
                    id="file-upload" 
                    accept=".docx" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden
                      ${state.file 
                        ? 'bg-indigo-50/60 border-indigo-400' 
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-400 hover:shadow-lg'
                      }`}
                  >
                    {state.file ? (
                      <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-300 z-10">
                        <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl shadow-sm flex items-center justify-center">
                           <FileCheck className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-indigo-900 text-lg line-clamp-1">{state.file.name}</p>
                           <p className="text-sm text-indigo-500 font-medium">Sẵn sàng xử lý • {Math.round(state.file.size/1024)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3 z-10">
                        <div className="w-14 h-14 bg-white text-slate-400 rounded-full shadow-sm flex items-center justify-center mx-auto group-hover/upload:text-indigo-600 group-hover/upload:scale-110 transition-all duration-300">
                          <FileUp className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-slate-700 font-bold text-lg group-hover/upload:text-indigo-700 transition-colors">Tải lên Giáo án (.docx)</p>
                            <p className="text-xs text-slate-400 mt-1">Hỗ trợ MathType & Công thức</p>
                        </div>
                      </div>
                    )}
                    {/* Hover effect background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/0 via-white/0 to-indigo-100/50 opacity-0 group-hover/upload:opacity-100 transition-opacity pointer-events-none"/>
                  </label>
               </div>

               {/* Main Action Button */}
               <button
                  disabled={!state.file || state.isProcessing}
                  onClick={handleProcess}
                  className={`mt-8 w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] relative overflow-hidden group
                    ${!state.file || state.isProcessing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:to-indigo-600'
                    }`}
                >
                  {state.isProcessing ? (
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang phân tích AI...</span>
                     </div>
                  ) : (
                     <>
                        <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        <span>Tích hợp Năng lực số ngay</span>
                     </>
                  )}
                </button>
            </div>

            {/* Success Result Card */}
            {state.result && (
              <div className="bg-gradient-to-r from-green-400 to-emerald-600 rounded-[2rem] p-1 shadow-xl animate-in slide-in-from-bottom-5 duration-500">
                 <div className="bg-white rounded-[1.8rem] p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                       <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className="text-xl font-bold text-slate-800">Thành công!</h3>
                       <p className="text-slate-500 font-medium">Giáo án mới đã được tích hợp đầy đủ.</p>
                    </div>
                    <button 
                       onClick={() => {
                          if (state.result) {
                             const url = URL.createObjectURL(state.result.blob);
                             const a = document.createElement('a');
                             a.href = url; a.download = state.result.fileName; a.click();
                          }
                       }}
                       className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1"
                    >
                       <Download className="w-5 h-5" /> Tải về máy
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Terminal Logs & Info */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* Terminal Window */}
             <div className="bg-[#0f172a] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] border border-slate-800/50 group/terminal">
                
                {/* Window Controls */}
                <div className="flex gap-2 mb-6 items-center">
                   <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors"></div>
                   <div className="ml-auto flex items-center gap-2 text-slate-500 text-xs font-mono uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">
                      <Terminal className="w-3 h-3" /> Console
                   </div>
                </div>
                
                {/* Log Content */}
                <div className="flex-1 font-mono text-sm overflow-y-auto custom-scrollbar space-y-3 pr-2 scroll-smooth">
                   {state.logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4 opacity-40">
                          <div className="w-16 h-16 border-2 border-slate-700 rounded-2xl flex items-center justify-center border-dashed animate-pulse">
                             <Info className="w-8 h-8" />
                          </div>
                          <p className="text-center font-medium">Ready to process...</p>
                      </div>
                   ) : (
                      state.logs.map((log, i) => (
                         <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                            <span className="text-indigo-500 shrink-0 select-none mt-0.5">$</span>
                            <span className={`${
                               log.includes("Lỗi") ? "text-red-400 font-bold" : 
                               log.includes("✓") || log.includes("✨") ? "text-green-400 font-semibold" : 
                               log.includes(">>") ? "text-blue-300" : "text-slate-300"
                            } break-words leading-relaxed`}>
                               {log.replace(">>", "")}
                            </span>
                         </div>
                      ))
                   )}
                   {state.isProcessing && (
                       <div className="flex gap-2 items-center text-indigo-400 mt-2 animate-pulse pl-5">
                           <span className="w-2 h-4 bg-indigo-500 block"></span>
                       </div>
                   )}
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase">
                   <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${state.isProcessing ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`}></span>
                      {state.isProcessing ? "PROCESSING..." : "IDLE"}
                   </span>
                   <span>React + Gemini 1.5</span>
                </div>
             </div>

             {/* Helper Tips */}
             <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Info className="w-5 h-5 text-indigo-500" /> Lưu ý quan trọng
                </h4>
                <div className="space-y-3">
                   {[
                      "File Word không được đặt mật khẩu.",
                      "Giữ nguyên các công thức MathType & Hình ảnh.",
                      "Nội dung NLS sẽ được chèn màu đỏ để dễ nhận biết."
                   ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-slate-600 bg-white/50 p-3 rounded-xl">
                         <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                         <span className="leading-snug">{tip}</span>
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
