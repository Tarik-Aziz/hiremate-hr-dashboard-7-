import React, { useState, useEffect } from "react";
import { Search, UserCheck, Star, BrainCircuit, ExternalLink, Mail, MessageSquare, Info, Sparkles, Trash2, ChevronDown } from "lucide-react";
import { subscribeToCandidates, Candidate, updateCandidate, deleteCandidate, seedCandidates } from "../services/candidateService";
import { rankCandidates } from "../services/geminiService";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function CandidatePage({ initialJobFilter }: { initialJobFilter?: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isRanking, setIsRanking] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [jobFilter, setJobFilter] = useState(initialJobFilter || "");
  const [refreshTrigger, setRefreshTrigger] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (initialJobFilter) setJobFilter(initialJobFilter);
  }, [initialJobFilter]);

  useEffect(() => {
    const { unsubscribe, refresh } = subscribeToCandidates((data) => {
      setCandidates(data);
      setLoading(false);
    });
    setRefreshTrigger(() => refresh);
    return () => unsubscribe();
  }, []);

  const handleAIRanking = async () => {
    setIsRanking(true);
    const context = "Evaluate candidates based on role requirements, experience depth, and specific tool proficiencies mentioned.";
    const rankings = await rankCandidates(context, candidates);
    
    for (let i = 0; i < candidates.length; i++) {
      if (rankings[i]) {
        await updateCandidate(candidates[i].id, {
          matchScore: rankings[i].score,
          matchVerdict: rankings[i].verdict,
          reasons: rankings[i].reasons
        });
      }
    }
    if (refreshTrigger) refreshTrigger();
    setIsRanking(false);
  };

  const handleDeleteCandidate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this candidate application?")) {
      await deleteCandidate(id);
      if (refreshTrigger) refreshTrigger();
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
    }
  };

  const handleUpdateStatus = async (status: Candidate["status"]) => {
    if (selectedCandidate) {
      await updateCandidate(selectedCandidate.id, { status });
      if (refreshTrigger) refreshTrigger();
      setSelectedCandidate({ ...selectedCandidate, status });
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    await seedCandidates();
    if (refreshTrigger) refreshTrigger();
  };

  const filteredCandidates = candidates.filter(can => {
    const matchesSearch = (can.name || "").toLowerCase().includes(search.toLowerCase()) || 
                         (can.jobTitle || "").toLowerCase().includes(search.toLowerCase());
    const matchesJob = jobFilter ? can.jobId === jobFilter : true;
    return matchesSearch && matchesJob;
  });

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">Track and evaluate potential hires</p>
        </div>
        <div className="flex items-center gap-3">
          {jobFilter && (
            <button 
              onClick={() => setJobFilter("")}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Clear Filter
            </button>
          )}
          {candidates.length === 0 && (
             <button onClick={handleSeed} className="px-6 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer">Seed Candidates</button>
          )}
          <button 
            onClick={handleAIRanking}
            disabled={isRanking || candidates.length === 0}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[20px] font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer group"
          >
            {isRanking ? (
               <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
            ) : <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            {isRanking ? "Analyzing..." : "AI Smart Rank"}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
              <Search className="text-gray-400 w-5 h-5" />
              <input 
                placeholder="Search candidates by name or role..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              />
           </div>

           {loading ? (
             <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
             </div>
           ) : filteredCandidates.length === 0 ? (
             <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
                <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium font-sans">No candidates found for this view.</p>
             </div>
           ) : filteredCandidates.map((can) => (
             <motion.div 
               layout
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               key={can.id} 
               onClick={() => setSelectedCandidate(can)}
               className={cn(
                 "bg-white p-5 rounded-2xl border transition-all cursor-pointer group relative",
                 selectedCandidate?.id === can.id ? "border-indigo-500 ring-4 ring-indigo-50" : "border-gray-50 hover:border-gray-200"
               )}
             >
               <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 relative">
                       <UserCheck className="w-7 h-7" />
                       {can.matchScore >= 90 && (
                         <div className="absolute -top-2 -right-2 bg-amber-400 p-1 rounded-lg text-white shadow-lg">
                           <Star className="w-3 h-3 fill-current" />
                         </div>
                       )}
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{can.name}</h3>
                       <p className="text-sm font-medium text-gray-500">{can.jobTitle}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 mb-1 justify-end">
                          <span className="text-lg font-black text-indigo-600">{can.matchScore}%</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match</span>
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          can.status === "Interview" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          can.status === "Offer" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          can.status === "Hired" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                          "bg-gray-50 text-gray-400 border border-gray-100"
                        )}>
                          {can.status}
                        </span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteCandidate(can.id, e)}
                      className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
               </div>
             </motion.div>
           ))}
        </div>

        <div className="w-96">
           <div className="bg-white rounded-3xl border border-gray-100 p-8 h-[calc(100vh-14rem)] sticky top-32 overflow-y-auto">
              {selectedCandidate ? (
                <div className="space-y-8">
                   <div className="text-center">
                      <div className="w-24 h-24 rounded-3xl bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                         <UserCheck className="w-12 h-12" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                      <p className="text-gray-500 font-medium mb-6">{selectedCandidate.jobTitle}</p>
                      
                      <div className="flex gap-2 justify-center mb-6">
                         <a 
                           href={selectedCandidate.email ? `mailto:${selectedCandidate.email}?subject=Regarding your application for ${selectedCandidate.jobTitle}` : "#"} 
                           className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                           title="Send email to candidate"
                         >
                           <Mail className="w-5 h-5" />
                         </a>
                         <button 
                           onClick={() => {
                             const templateText = `Hi ${selectedCandidate.name}, we've reviewed your application for the ${selectedCandidate.jobTitle} position at HireMate. We'd love to schedule a quick introductory chat!`;
                             navigator.clipboard.writeText(templateText);
                             alert(`Professional interview outreach template copied to clipboard! Ready to send to ${selectedCandidate.name}.`);
                           }}
                           className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                           title="Copy SMS outreach template"
                         >
                           <MessageSquare className="w-5 h-5" />
                         </button>
                         <div className="relative group/status flex-1">
                            <button className="w-full h-full bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-2">
                               Update Status
                               <ChevronDown className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 hidden group-hover/status:block z-50">
                               {["Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"].map((s) => (
                                 <button 
                                  key={s} 
                                  onClick={() => handleUpdateStatus(s as any)}
                                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 rounded-xl text-sm font-bold text-gray-600 transition-colors"
                                 >
                                    {s}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Match Insights</h4>
                         <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-3">
                               <Sparkles className="w-4 h-4 text-indigo-600" />
                               <span className="text-sm font-bold text-indigo-700">{selectedCandidate.matchVerdict || "Analyzing..."}</span>
                            </div>
                            <ul className="space-y-2">
                               {selectedCandidate.reasons?.map((reason, idx) => (
                                 <li key={idx} className="text-xs text-gray-600 flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                                    {reason}
                                 </li>
                               ))}
                               {!selectedCandidate.reasons && (
                                 <li className="text-xs text-gray-400 italic">No AI insights generated yet. Click Smart Rank to begin.</li>
                               )}
                            </ul>
                         </div>
                      </div>

                      <div>
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Info</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                               <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Experience</p>
                               <p className="text-sm font-bold text-gray-700">{selectedCandidate.experience}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                               <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Applied Date</p>
                               <p className="text-sm font-bold text-gray-700">{new Date(selectedCandidate.appliedAt).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>

                      <div>
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Core Skills</h4>
                         <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map((skill, idx) => (
                               <span key={idx} className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-600">{skill}</span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button className="w-full flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm py-4 border-2 border-dashed border-indigo-100 rounded-2xl hover:bg-indigo-50 transition-all cursor-pointer">
                      <ExternalLink className="w-4 h-4" />
                      View Full Resume
                   </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Info className="w-10 h-10" />
                   </div>
                   <p className="font-medium">Select a candidate to view detailed AI insights and take action.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </main>
  );
}
