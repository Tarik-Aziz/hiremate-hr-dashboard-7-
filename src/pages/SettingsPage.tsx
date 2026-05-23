import { useState, useEffect } from "react";
import { Settings, Bell, Shield, Database, Globe, User, Save, RefreshCcw } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { getApiUrl } from "../services/api";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [dbStatus, setDbStatus] = useState<{ isInMemoryMode: boolean; mongodbUriSet: boolean; lastDbError?: string | null } | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const checkDbStatus = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch(getApiUrl("/api/debug?force=true"));
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          isInMemoryMode: data.isInMemoryMode,
          mongodbUriSet: data.mongodbUriSet,
          lastDbError: data.lastDbError
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: Database },
  ];

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your application preferences and configurations</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-gray-100 p-6 space-y-2 bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:bg-white hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">General Preferences</h3>
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                        <input defaultValue="HireMate AI" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Workspace ID</label>
                        <input defaultValue="hm-12345" disabled className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-400 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Primary Language</label>
                      <select className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>English (US)</option>
                        <option>Bengali</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>UTC +6 (Dhaka)</option>
                        <option>UTC +0 (London)</option>
                        <option>UTC -5 (New York)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                   <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                      <Save className="w-5 h-5" />
                      Save Changes
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                key="database"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
                  <Database className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h4 className="text-amber-900 font-bold">Persistence Configuration</h4>
                    <p className="text-amber-800/80 text-sm mt-1">
                      To persist your data, you must configure your <span className="font-bold">MONGODB_URI</span> in the application environment (Settings menu in AI Studio). 
                      Local development configurations will not work in the cloud preview.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Connection Status</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl font-sans">
                       {checkingDb ? (
                        <>
                          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                          <span className="text-sm font-bold text-gray-600">Verifying Connection...</span>
                        </>
                       ) : dbStatus ? (
                         dbStatus.isInMemoryMode ? (
                           <>
                             <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                             <span className="text-sm font-bold text-amber-700">InMemory Demo Mode (Live Connection Missing)</span>
                              {dbStatus?.lastDbError && (
                                <span className="block mt-2.5 text-[11px] text-rose-600 font-mono bg-rose-50/50 p-2 rounded-lg border border-rose-100 max-w-sm">
                                  Error: {dbStatus.lastDbError}
                                </span>
                              )}
                              <span></span>
                           </>
                         ) : (
                           <>
                             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                             <span className="text-sm font-bold text-emerald-700">Connected (MongoDB Active & Syncing)</span>
                           </>
                         )
                       ) : (
                         <>
                           <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                           <span className="text-sm font-bold text-gray-500">Checking Status...</span>
                         </>
                       )}
                       <button 
                        onClick={checkDbStatus}
                        disabled={checkingDb}
                        className="ml-auto text-indigo-600 hover:text-indigo-800 text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                       >
                         <RefreshCcw className={cn("w-3 h-3", checkingDb && "animate-spin")} />
                         {checkingDb ? "Retrying..." : "Refresh"}
                       </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Demo Data</label>
                    <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                      If you haven't connected your database yet, you can reset all modules to use predefined demo content for exploration.
                    </p>
                    <button 
                      onClick={async () => {
                        const { getDashboardStats } = await import("../services/dashboardService");
                        const { seedEmployees } = await import("../services/employeeService");
                        const { seedJobs } = await import("../services/jobService");
                        const { seedCandidates } = await import("../services/candidateService");
                        await seedEmployees();
                        await seedJobs();
                        await seedCandidates();
                        alert("Predefined demo data seeded into system successfully!");
                      }}
                      className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="space-y-6">
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                             <Shield className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="text-emerald-900 font-bold">Two-Factor Authentication</h4>
                             <p className="text-emerald-800/80 text-sm">Add an extra layer of security to your admin account.</p>
                          </div>
                       </div>
                       <button className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm">Enable</button>
                    </div>

                    <div>
                      <h4 className="text-gray-900 font-bold mb-4">API Permissions</h4>
                      <div className="space-y-3">
                         {["Employees Read", "Jobs Write", "Analytics Access", "Resume Parsing"].map(perm => (
                           <label key={perm} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <span className="font-bold text-gray-700">{perm}</span>
                              <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded" />
                           </label>
                         ))}
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
               <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
               >
                  <div className="space-y-4">
                     {["New Applicant Alerts", "Employee Anniversary", "Performance Review Reminders", "System Updates"].map(note => (
                        <div key={note} className="flex items-center justify-between p-4 border-b border-gray-50">
                           <div>
                              <p className="font-bold text-gray-900">{note}</p>
                              <p className="text-xs text-gray-500 font-medium">Get notified via email and dashboard</p>
                           </div>
                           <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

import { AnimatePresence } from "motion/react";
