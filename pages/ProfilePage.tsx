import { User, Mail, Globe, MapPin, Shield, Edit2, LogOut } from "lucide-react";
import { motion } from "motion/react";

export function ProfilePage({ onSignOut }: { onSignOut?: () => void }) {
  const user = {
    name: "Admin User",
    email: "admin@hiremate.ai",
    role: "Senior HR Director",
    company: "HireMate Enterprise",
    location: "San Francisco, CA",
    joinedAt: "Jan 2024",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=128"
  };

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header/Cover */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
             <button className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all">
                <Edit2 className="w-5 h-5" />
             </button>
          </div>
          
          <div className="px-10 pb-12 relative">
             {/* Avatar */}
             <div className="absolute -top-16 left-10">
                <div className="w-32 h-32 rounded-3xl border-8 border-white bg-white overflow-hidden shadow-xl ring-1 ring-black/5">
                   <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
             </div>

             <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
                   <p className="text-indigo-600 font-bold text-lg mt-1">{user.role}</p>
                   <div className="flex items-center gap-6 mt-6 text-gray-500 text-sm font-medium">
                      <div className="flex items-center gap-1.5">
                         <Globe className="w-4 h-4" />
                         {user.company}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <MapPin className="w-4 h-4" />
                         {user.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Shield className="w-4 h-4" />
                         Administrator
                      </div>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer">
                      Edit Profile
                   </button>
                   <button 
                    onClick={onSignOut}
                    className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2 cursor-pointer"
                   >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 border-t border-gray-50 pt-12">
                <div className="space-y-6">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Contact Information</h3>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                            <Mail className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Work Email</p>
                            <p className="text-sm font-bold text-gray-700">{user.email}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About Me</h3>
                   <p className="text-gray-600 leading-relaxed font-medium">
                      Passionate HR professional with over 10 years of experience in high-growth technology companies. 
                      Focused on building inclusive cultures and streamlining recruitment processes using AI and data-driven insights.
                   </p>
                   
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                         <h4 className="text-sm font-bold text-indigo-700 mb-1">Active Projects</h4>
                         <p className="text-3xl font-black text-indigo-600">12</p>
                      </div>
                      <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-3xl">
                         <h4 className="text-sm font-bold text-purple-700 mb-1">Candidates Hired</h4>
                         <p className="text-3xl font-black text-purple-600">148</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
