import { useState } from "react";
import { SearchCode, FileUp, Sparkles, BrainCircuit, User, Mail, GraduationCap, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { parseResumeText } from "../services/geminiService";

export function ResumeParsingPage() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [resumeText, setResumeText] = useState("");

  const handleParse = async () => {
    if (!resumeText) return;
    setIsParsing(true);
    try {
      const parsed = await parseResumeText(resumeText);
      setParsedData(parsed);
    } catch (error) {
      console.error("Parsing error:", error);
    }
    setIsParsing(false);
  };

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Parsing</h1>
          <p className="text-gray-500 mt-1">Automatically extract data from candidate resumes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                 <FileUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Input Resume Text</h3>
           </div>
           <p className="text-sm text-gray-500">Paste the raw text from a candidate's resume here for instant analysis.</p>
           <textarea 
             value={resumeText}
             onChange={(e) => setResumeText(e.target.value)}
             className="w-full h-80 p-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none transition-all"
             placeholder="Paste resume content here..."
           />
           <button 
             onClick={handleParse}
             disabled={isParsing || !resumeText}
             className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
           >
             {isParsing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
             ) : <BrainCircuit className="w-5 h-5" />}
             {isParsing ? "Parsing Resume..." : "Extract Data with AI"}
           </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                 <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Extracted Insights</h3>
           </div>

           {parsedData ? (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 flex-1">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {parsedData.name?.charAt(0)}
                   </div>
                   <div>
                      <h4 className="text-2xl font-bold text-gray-900">{parsedData.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                         <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {parsedData.email}
                         </div>
                         <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {parsedData.experience} Years
                         </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                         <SearchCode className="w-4 h-4 text-indigo-600" />
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.skills?.map((s: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-gray-600 border border-gray-200">{s}</span>
                        ))}
                      </div>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                         <GraduationCap className="w-4 h-4 text-purple-600" />
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Education</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">{parsedData.education}</p>
                   </div>
                </div>

                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Career Highlights</h4>
                   <div className="space-y-3">
                      {parsedData.topExperiences?.map((exp: string, i: number) => (
                        <div key={i} className="p-4 rounded-2xl bg-white border border-gray-100 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                           <div className="w-8 h-8 rounded-lg bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 text-xs font-bold">
                              {i + 1}
                           </div>
                           <p className="text-sm text-gray-600 leading-relaxed font-medium">{exp}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                   <FileUp className="w-10 h-10" />
                </div>
                <p className="max-w-xs font-medium">Input candidate resume text on the left to see AI-extracted insights here.</p>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
