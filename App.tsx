import React, { useState } from 'react';
import { 
  FileUp, Wand2, FileCheck, Info, Download, 
  BookOpen, Sparkles, Zap, ChevronRight, CheckCircle2, AlertCircle, Terminal
} from 'lucide-react';
import { AppState, SubjectType, GradeType } from './types';
import { extractTextFromDocx, createIntegrationTextPrompt } from './utils';
import { generateCompetencyIntegration } from './services/geminiService';
import { injectContentIntoDocx } from './services/docxManipulator';

// --- CẤU HÌNH LOGO Ở ĐÂY ---
// Hãy thay ID ảnh Google Drive của bạn vào phía sau dấu "="
const LOGO_URL = "https://drive.google.com/uc?export=view&id=1jC3-XU_18Cj-C8_X-1jC3-XU_18Cj-C8"; 
// Nếu chưa có ảnh, nó sẽ hiện icon mặc định.

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
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-200 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
           <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden border border-white/50">
                    {/* LOGO DISPLAY */}
                    <img 
                      src={LOGO_URL} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback nếu link ảnh lỗi
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-icon');
                      }}
                    />
                    {/* Icon dự phòng nếu ảnh lỗi */}
                    <Sparkles className="w-8 h-8 text-indigo-600 absolute opacity-0 icon-fallback" />
                    <style>{`.fallback-icon .icon-fallback { opacity: 1; }`}</style>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  NLS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">Integrator</span> Pro
                </h1>
                <p className="text-slate-500 font-medium text-sm">Trợ lý AI tích hợp Năng lực số 2025</p>
              </div>
           </div>
           
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white shadow-sm text-sm font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input & Config */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-2xl shadow-indigo-500/10 transition-all hover:shadow-indigo-500/20">
               
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Thiết lập bài dạy</h2>
               </div>

               {/* Form Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Môn học</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 pl-4 pr-10 bg-white border-2 border-slate-100 rounded-2xl appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700"
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
                      <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Khối lớp</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 pl-4 pr-10 bg-white border-2 border-slate-100 rounded-2xl appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700"
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
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none rotate-90" />
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
                    className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-3xl cursor-pointer transition-all duration-300
                      ${state.file 
                        ? 'bg-indigo-50/50 border-indigo-400' 
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-lg'
                      }`}
                  >
                    {state.file ? (
                      <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                           <FileCheck className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-indigo-900 line-clamp-1">{state.file.name}</p>
                           <p className="text-xs text-indigo-500 font-medium">Sẵn sàng xử lý</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-white text-slate-400 rounded-full shadow-sm flex items-center justify-center mx-auto group-hover/upload:text-indigo-500 group-hover/upload:scale-110 transition-transform">
                          <FileUp className="w-6 h-6" />
                        </div>
                        <p className="text-slate-600 font-medium">Tải lên file Word (.docx)</p>
                        <p className="text-xs text-slate-400">Hỗ trợ MathType & Công thức</p>
                      </div>
                    )}
                  </label>
               </div>

               {/* Main Action Button */}
               <button
                  disabled={!state.file || state.isProcessing}
                  onClick={handleProcess}
                  className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] relative overflow-hidden group
                    ${!state.file || state.isProcessing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 hover:shadow-indigo-500/60'
                    }`}
                >
                  {state.isProcessing ? (
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang phân tích AI...</span>
                     </div>
                  ) : (
                     <>
                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Tích hợp Năng lực số</span>
                     </>
                  )}
                </button>
            </div>

            {/* Result Notification */}
            {state.result && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-1 shadow-xl animate-in slide-in-from-bottom-5">
                 <div className="bg-white rounded-[1.4rem] p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                       <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h3 className="text-lg font-bold text-slate-800">Thành công!</h3>
                       <p className="text-slate-500 text-sm">Giáo án mới đã sẵn sàng tải về.</p>
                    </div>
                    <button 
                       onClick={() => {
                          if (state.result) {
                             const url = URL.createObjectURL(state.result.blob);
                             const a = document.createElement('a');
                             a.href = url; a.download = state.result.fileName; a.click();
                          }
                       }}
                       className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
                    >
                       <Download className="w-4 h-4" /> Tải về ngay
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Terminal Logs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px] border border-slate-800">
                {/* Mac OS window controls decoration */}
                <div className="flex gap-2 mb-6">
                   <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-4 border-b border-slate-800 pb-4 uppercase tracking-widest">
                   <Terminal className="w-4 h-4" /> System Console
                </div>
                
                <div className="flex-1 font-mono text-sm overflow-y-auto custom-scrollbar space-y-3 pr-2">
                   {state.logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-3 opacity-50">
                          <div className="w-12 h-12 border-2 border-slate-800 rounded-xl flex items-center justify-center border-dashed">
                             <Info className="w-6 h-6" />
                          </div>
                          <p>Waiting for user input...</p>
                      </div>
                   ) : (
                      state.logs.map((log, i) => (
                         <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-indigo-500 shrink-0 select-none">$</span>
                            <span className={`${
                               log.includes("Lỗi") ? "text-red-400" : 
                               log.includes("✓") || log.includes("✨") ? "text-green-400" : "text-slate-300"
                            } break-words`}>
                               {log}
                            </span>
                         </div>
                      ))
                   )}
                   {state.isProcessing && (
                       <div className="flex gap-2 items-center text-indigo-400 mt-2 animate-pulse">
                           <span>_</span>
                       </div>
                   )}
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase">
                   <span>Status: {state.isProcessing ? "PROCESSING" : "IDLE"}</span>
                   <span>V2.5.0 STABLE</span>
                </div>
             </div>

             {/* Helper Tips */}
             <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Info className="w-4 h-4 text-indigo-500" /> Lưu ý quan trọng
                </h4>
                <ul className="space-y-2">
                   {[
                      "File Word không được đặt mật khẩu.",
                      "Giữ nguyên các công thức MathType.",
                      "Nội dung NLS sẽ được chèn màu đỏ để dễ nhận biết."
                   ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                         <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                         <span>{tip}</span>
                      </li>
                   ))}
                </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
