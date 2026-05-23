import { User, Mail, Globe, MapPin, Shield, Edit2, LogOut, Save, X, Briefcase, CalendarDays, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getProfile, updateProfile, Profile } from "../services/profileService";

export function ProfilePage({ onSignOut, userEmail }: { onSignOut?: () => void; userEmail?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await getProfile(userEmail || "admin@hiremate.ai");
      if (data) {
        setProfile(data);
        setEditName(data.name);
        setEditRole(data.role);
        setEditCompany(data.company);
        setEditLocation(data.location);
        setEditBio(data.bio);
      }
      setLoading(false);
    };
    loadProfile();
  }, [userEmail]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const success = await updateProfile({
      email: profile.email,
      name: editName,
      role: editRole,
      company: editCompany,
      location: editLocation,
      bio: editBio,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}&background=6366f1&color=fff&size=128`,
    });
    if (success) {
      // Refresh profile from server
      const updated = await getProfile(userEmail || "admin@hiremate.ai");
      if (updated) setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditName(profile.name);
      setEditRole(profile.role);
      setEditCompany(profile.company);
      setEditLocation(profile.location);
      setEditBio(profile.bio);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF] flex items-center justify-center">
        <p className="text-gray-500">Could not load profile data.</p>
      </main>
    );
  }

  const joinedFormatted = new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header/Cover */}
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
             <button 
               onClick={() => setIsEditing(!isEditing)}
               className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all cursor-pointer"
             >
                <Edit2 className="w-5 h-5" />
             </button>
          </div>
          
          <div className="px-10 pb-12 relative">
             {/* Avatar */}
             <div className="absolute -top-16 left-10">
                <div className="w-32 h-32 rounded-3xl border-8 border-white bg-white overflow-hidden shadow-xl ring-1 ring-black/5">
                   <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
             </div>

             {/* Save success toast */}
             <AnimatePresence>
               {saveSuccess && (
                 <motion.div 
                   initial={{ opacity: 0, y: -20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="absolute top-4 right-10 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-200 shadow-lg"
                 >
                   <Check className="w-4 h-4" />
                   Profile saved successfully!
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="pt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   {isEditing ? (
                     <input 
                       value={editName}
                       onChange={(e) => setEditName(e.target.value)}
                       className="text-4xl font-extrabold text-gray-900 tracking-tight bg-gray-50 px-4 py-2 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                     />
                   ) : (
                     <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{profile.name}</h1>
                   )}
                   {isEditing ? (
                     <input 
                       value={editRole}
                       onChange={(e) => setEditRole(e.target.value)}
                       className="text-indigo-600 font-bold text-lg mt-2 bg-gray-50 px-4 py-2 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                     />
                   ) : (
                     <p className="text-indigo-600 font-bold text-lg mt-1">{profile.role}</p>
                   )}
                   <div className="flex items-center gap-6 mt-6 text-gray-500 text-sm font-medium flex-wrap">
                      <div className="flex items-center gap-1.5">
                         <Globe className="w-4 h-4" />
                         {isEditing ? (
                           <input 
                             value={editCompany}
                             onChange={(e) => setEditCompany(e.target.value)}
                             className="bg-gray-50 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-44"
                           />
                         ) : (
                           profile.company
                         )}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <MapPin className="w-4 h-4" />
                         {isEditing ? (
                           <input 
                             value={editLocation}
                             onChange={(e) => setEditLocation(e.target.value)}
                             className="bg-gray-50 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-44"
                           />
                         ) : (
                           profile.location
                         )}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Shield className="w-4 h-4" />
                         Administrator
                      </div>
                      <div className="flex items-center gap-1.5">
                         <CalendarDays className="w-4 h-4" />
                         Joined {joinedFormatted}
                      </div>
                   </div>
                </div>
                <div className="flex gap-3">
                   {isEditing ? (
                     <>
                       <button 
                         onClick={handleCancelEdit}
                         className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-2"
                       >
                         <X className="w-5 h-5" />
                         Cancel
                       </button>
                       <button 
                         onClick={handleSave}
                         disabled={saving}
                         className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-100 disabled:opacity-50"
                       >
                         <Save className="w-5 h-5" />
                         {saving ? "Saving..." : "Save Changes"}
                       </button>
                     </>
                   ) : (
                     <>
                       <button 
                         onClick={() => setIsEditing(true)}
                         className="px-6 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"
                       >
                         Edit Profile
                       </button>
                       <button 
                         onClick={onSignOut}
                         className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center gap-2 cursor-pointer"
                       >
                         <LogOut className="w-5 h-5" />
                         Sign Out
                       </button>
                     </>
                   )}
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
                            <p className="text-sm font-bold text-gray-700">{profile.email}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About Me</h3>
                   {isEditing ? (
                     <textarea 
                       value={editBio}
                       onChange={(e) => setEditBio(e.target.value)}
                       rows={4}
                       className="w-full text-gray-600 leading-relaxed font-medium bg-gray-50 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                     />
                   ) : (
                     <p className="text-gray-600 leading-relaxed font-medium">
                       {profile.bio}
                     </p>
                   )}
                   
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                         <h4 className="text-sm font-bold text-indigo-700 mb-1">Active Projects</h4>
                         <p className="text-3xl font-black text-indigo-600">{profile.activeProjects}</p>
                      </div>
                      <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-3xl">
                         <h4 className="text-sm font-bold text-purple-700 mb-1">Candidates Hired</h4>
                         <p className="text-3xl font-black text-purple-600">{profile.candidatesHired}</p>
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
