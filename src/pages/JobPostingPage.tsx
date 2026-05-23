import { useState, useEffect } from "react";
import { Plus, Search, MapPin, Building2, Clock, DollarSign, Sparkles, Send, Trash2, Edit2 } from "lucide-react";
import { subscribeToJobs, Job, addJob, updateJob, seedJobs } from "../services/jobService";
import { generateJobDescription } from "../services/geminiService";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function JobPostingPage({ onNavigateToCandidates }: { onNavigateToCandidates: (jobId: string) => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const { unsubscribe, refresh } = subscribeToJobs((data) => {
      setJobs(data);
      setLoading(false);
    });
    setRefreshTrigger(() => refresh);
    return () => unsubscribe();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      const { deleteJob } = await import("../services/jobService");
      await deleteJob(id);
      if (refreshTrigger) refreshTrigger();
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    await seedJobs();
    if (refreshTrigger) refreshTrigger();
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const desc = await generateJobDescription(aiTitle, aiKeywords);
    setAiResult(desc);
    setIsGenerating(false);
  };

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 mt-1">Manage and track your active job listings</p>
        </div>
        <div className="flex items-center gap-3">
          {jobs.length === 0 && (
             <button onClick={handleSeed} className="px-6 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer">Seed Jobs</button>
          )}
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[20px] font-bold hover:shadow-xl hover:shadow-purple-200 transition-all active:scale-95 cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            AI Generator
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto"></div>
           </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
             <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs posted yet</h3>
             <p className="text-gray-500 max-w-sm mx-auto mb-8">Start your recruitment process by posting your first job opening.</p>
             <button onClick={() => setIsAddModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 cursor-pointer">Post a Job</button>
          </div>
        ) : jobs.map((job) => (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={job.id} 
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      job.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                      job.status === "Draft" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {job.employmentType}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {job.salaryRange}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setEditingJob(job);
                    setIsAddModalOpen(true);
                  }}
                  className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Views</p>
                  <p className="text-lg font-bold text-gray-900">{(job.views || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Applicants</p>
                  <p className="text-lg font-bold text-gray-900">{job.applicants}</p>
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Posted On</p>
                   <p className="text-sm font-bold text-gray-600">{new Date(job.postedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden ring-1 ring-gray-100">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Job${job.id}${i}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-100">
                    +{Math.max(0, job.applicants - 3)}
                  </div>
                </div>
                <button 
                  onClick={() => onNavigateToCandidates(job.id)}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  View Candidates
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Job Description Generator</h3>
                  <p className="text-sm text-gray-500 font-medium">Create professional descriptions in seconds</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                   <input 
                    placeholder="e.g. Senior Frontend Engineer"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500" 
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Key Requirements / Skills</label>
                   <textarea 
                    rows={3}
                    placeholder="e.g. 5+ years experience, React, Node.js, Leadership skills..."
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none" 
                   />
                </div>
                {aiResult && (
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAIModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !aiTitle}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? "Generating..." : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {aiResult ? "Regenerate" : "Generate Description"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="p-8">
               <h3 className="text-2xl font-bold text-gray-900 mb-6">{editingJob ? "Edit Job Posting" : "Create New Job Posting"}</h3>
               <form onSubmit={async (e) => {
                 e.preventDefault();
                 const btn = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
                 if (btn) btn.disabled = true;
                 
                 try {
                   const formData = new FormData(e.currentTarget);
                   const jobData = {
                     title: formData.get("title") as string,
                     department: formData.get("department") as string,
                     location: formData.get("location") as string,
                     employmentType: formData.get("type") as string,
                     salaryRange: formData.get("salary") as string,
                   };

                   if (editingJob) {
                     await updateJob(editingJob.id, jobData);
                   } else {
                     await addJob({
                       ...jobData,
                       description: "TBD",
                       views: 0,
                       applicants: 0,
                       status: "Active",
                       postedAt: new Date().toISOString(),
                       platforms: ["LinkedIn"]
                     });
                   }
                   
                   if (refreshTrigger) refreshTrigger();
                   setIsAddModalOpen(false);
                   setEditingJob(null);
                 } catch (err) {
                   console.error(err);
                 } finally {
                   if (btn) btn.disabled = false;
                 }
               }} className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                    <input name="title" defaultValue={editingJob?.title || ""} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                      <input name="department" defaultValue={editingJob?.department || ""} required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                      <input name="location" defaultValue={editingJob?.location || ""} placeholder="e.g. Hybrid, Remote" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                      <select name="type" defaultValue={editingJob?.employmentType || "Full-time"} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Full-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Salary Range</label>
                       <input name="salary" defaultValue={editingJob?.salaryRange || ""} placeholder="$50k - $80k" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-6">
                    <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingJob(null); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 cursor-pointer">{editingJob ? "Save Changes" : "Post Job"}</button>
                 </div>
               </form>
            </div>
           </motion.div>
        </div>
      )}
    </main>
  );
}
