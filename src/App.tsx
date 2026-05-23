import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { EmployeesPage } from "./pages/EmployeesPage";
import { JobPostingPage } from "./pages/JobPostingPage";
import { CandidatePage } from "./pages/CandidatePage";
import { ReportingPage } from "./pages/ReportingPage";
import { ResumeParsingPage } from "./pages/ResumeParsingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CalendarPage } from "./pages/CalendarPage";
import { Briefcase, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

// Mock User type to replace Firebase User
interface MockUser {
  displayName: string;
  photoURL: string;
  email: string;
}

import { getApiUrl } from "./services/api";

export default function App() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState("dashboard");
  const [activeParams, setActiveParams] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [dbInMemory, setDbInMemory] = useState(false);
  
  // Custom Registration and Password Recovery states
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("HR Manager");
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const navigate = (id: string, params?: any) => {
    setActiveId(id);
    setActiveParams(params);
  };

  useEffect(() => {
    // Restore user from locale storage if exists
    const savedUser = localStorage.getItem("hiremate_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Verify database connection status
    fetch(getApiUrl("/api/debug"))
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.isInMemoryMode === "boolean") {
          setDbInMemory(data.isInMemoryMode);
        }
      })
      .catch(err => console.warn("Error tracking db status:", err));
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    // Check custom registered users in localStorage
    const savedCustomUsersStr = localStorage.getItem("hiremate_custom_users");
    const customUsers = savedCustomUsersStr ? JSON.parse(savedCustomUsersStr) : [];
    
    const matchedUser = customUsers.find((u: any) => u.email === email && u.password === password);

    // Demo credentials
    if (email === "admin@hiremate.ai" && password === "admin123") {
      const mockUser = {
        displayName: "Admin User",
        email: "admin@hiremate.ai",
        photoURL: "https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
      };
      setUser(mockUser);
      localStorage.setItem("hiremate_user", JSON.stringify(mockUser));
    } else if (matchedUser) {
      const mockUser = {
        displayName: matchedUser.name,
        email: matchedUser.email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name)}&background=10b981&color=fff`
      };
      setUser(mockUser);
      localStorage.setItem("hiremate_user", JSON.stringify(mockUser));
    } else {
      setLoginError("Invalid email or password. Hint: admin@hiremate.ai / admin123");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setForgotSuccess("");
    
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLoginError("Please fill out all fields.");
      return;
    }

    // Save user to localStorage
    const savedCustomUsersStr = localStorage.getItem("hiremate_custom_users");
    const customUsers = savedCustomUsersStr ? JSON.parse(savedCustomUsersStr) : [];
    
    // Check if email already registered
    if (email === "admin@hiremate.ai" || customUsers.some((u: any) => u.email === email)) {
      setLoginError("This email address is already registered.");
      return;
    }

    const newUser = { name, email, password, role };
    customUsers.push(newUser);
    localStorage.setItem("hiremate_custom_users", JSON.stringify(customUsers));

    // Show a success notification or direct login
    alert(`Account created successfully for ${name}! You can now sign in with your email.`);
    setIsSignUp(false);
    // Auto-fill login email for convenience
    setEmail(email);
    setPassword("");
    setLoginError("");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setForgotSuccess("");
    
    if (!forgotEmail.trim()) {
      setLoginError("Please enter your email.");
      return;
    }

    // Simulate lookup
    const savedCustomUsersStr = localStorage.getItem("hiremate_custom_users");
    const customUsers = savedCustomUsersStr ? JSON.parse(savedCustomUsersStr) : [];
    
    const exists = forgotEmail === "admin@hiremate.ai" || customUsers.some((u: any) => u.email === forgotEmail);
    if (exists) {
      setForgotSuccess("A temporary password reset link has been simulated. Check your inbox!");
      setTimeout(() => {
        setIsForgot(false);
        setForgotSuccess("");
        // Load reset email into sign in for ease
        setEmail(forgotEmail);
        setForgotEmail("");
      }, 3000);
    } else {
      setLoginError("We couldn't find an account matching that email address.");
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("hiremate_user");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFBFF]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F2F5] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-2xl p-10 rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-white max-w-md w-full relative z-10 mx-4"
        >
          <div className="text-center mb-8">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[28px] mx-auto mb-4 flex items-center justify-center shadow-xl shadow-indigo-200 ring-4 ring-indigo-50 cursor-pointer"
              onClick={() => {
                setIsForgot(false);
                setIsSignUp(false);
                setLoginError("");
                setForgotSuccess("");
              }}
            >
               <Briefcase className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">HireMate</h1>
            <p className="text-gray-500 mt-1.5 font-medium">Enterprise HR Intelligence</p>
          </div>

          {/* Tab Selector when not in Forgot Password Mode */}
          {!isForgot && (
            <div className="flex bg-gray-50 p-1.5 rounded-[20px] mb-6">
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setLoginError("");
                  setForgotSuccess("");
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all cursor-pointer",
                  !isSignUp ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setLoginError("");
                  setForgotSuccess("");
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all cursor-pointer",
                  isSignUp ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Sign Up
              </button>
            </div>
          )}

          {isForgot ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-gray-800">Reset Password</h3>
                <p className="text-xs text-gray-500 mt-0.5">Enter your email and we'll send a password recovery path.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Work Email</label>
                <input 
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@hiremate.ai"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </motion.div>
              )}

              {forgotSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold border border-emerald-100"
                >
                  {forgotSuccess}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-2xl py-4.5 font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 cursor-pointer mt-2"
              >
                Send Recovery Instructions
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgot(false);
                  setLoginError("");
                  setForgotSuccess("");
                }}
                className="w-full text-indigo-600 hover:underline text-sm font-bold cursor-pointer mt-2 block"
              >
                Back to Sign In
              </button>
            </form>
          ) : isSignUp ? (
            /* Sign Up / Registration Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Work Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@hiremate.ai"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-600"
                >
                  <option value="HR Manager">HR Manager</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Interviewer">Interviewer</option>
                  <option value="Viewer">Viewer</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-2xl py-4.5 font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 cursor-pointer mt-4"
              >
                Register & Continue
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Work Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hiremate.ai"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex justify-between items-center">
                  Password
                  <button 
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgot(true);
                      setLoginError("");
                      setForgotSuccess("");
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer bg-transparent border-none outline-none"
                  >
                    Forgot?
                  </button>
                </label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold"
                  required
                />
              </div>

              {/* Interactive Autocomplete/Seeding credentials */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setEmail("admin@hiremate.ai");
                  setPassword("admin123");
                  setLoginError("");
                }}
                className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[24px] relative overflow-hidden shadow-sm cursor-pointer select-none group"
                title="Click to automatically fill credentials"
              >
                <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform">
                  <Briefcase className="w-20 h-20 text-indigo-900" />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Demo Access Activated</p>
                  <span className="text-[9px] text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md transition-all group-hover:bg-indigo-600 group-hover:text-white">AUTO FILL</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-bold">EMAIL</span>
                    <span className="text-sm text-indigo-900 font-extrabold tracking-tight">admin@hiremate.ai</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-indigo-50/50 pt-1">
                    <span className="text-[11px] text-gray-500 font-bold">PASS</span>
                    <span className="text-sm text-indigo-900 font-black font-mono">admin123</span>
                  </div>
                </div>
              </motion.div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-2xl py-4.5 font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 cursor-pointer mt-4"
              >
                Sign In to Dashboard
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 text-center mt-8 font-medium">
            Contact support or <span 
              onClick={() => alert("Please contact HireMate HR Admin Support line (support@hiremate.ai) for corporate inquiries.")} 
              className="text-indigo-600 cursor-pointer hover:underline font-bold"
            >
              System Administrator
            </span>
          </p>
        </motion.div>

        <div className="absolute bottom-8 text-gray-400 text-sm font-medium">
          © 2026 HireMate AI. Built for Modern Workplaces.
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeId) {
      case "dashboard":
        return <Dashboard />;
      case "employees":
        return <EmployeesPage />;
      case "job-post":
      case "job-posting":
        return <JobPostingPage onNavigateToCandidates={(jobId) => navigate("candidates", { jobId })} />;
      case "candidates":
      case "candidate":
        return <CandidatePage initialJobFilter={activeParams?.jobId} />;
      case "report":
        return <ReportingPage />;
      case "resume-parsing":
        return <ResumeParsingPage />;
      case "setting":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage onSignOut={handleSignOut} userEmail={user?.email} />;
      case "calendar":
        return <CalendarPage />;
      default:
        return (
          <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF] flex flex-col items-center justify-center text-center">
            <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-50 max-w-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 capitalize">{activeId.replace("-", " ")}</h2>
              <p className="text-gray-500 mb-0">This module is currently under development. Please check back later for updates on {activeId.replace("-", " ")} features.</p>
              <button 
                 onClick={() => navigate("dashboard")}
                 className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-50 transition-all active:scale-95 cursor-pointer"
              >
                 Return to Dashboard
              </button>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] relative">
      <Sidebar activeId={activeId} onSetActive={(id) => navigate(id)} user={user} />
      <div>
        <TopBar onSignOut={handleSignOut} userProfileUrl={user.photoURL || ""} />
        
        {dbInMemory && (
          <div className="ml-64 mx-8 mt-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-extrabold text-amber-900 block mb-0.5 animate-pulse">⚠️ Database Connection Falling Back to In-Memory Demo Mode</span>
              <p className="text-amber-800 font-medium leading-relaxed">
                Your custom changes in this web preview are saved in temporary memory and won't sync to your real MongoDB Atlas because Atlas blocks dynamic cloud container IPs by default. (Since it's dynamic, it acts as an unwhitelisted connection).
              </p>
              <div className="mt-2 text-xs font-semibold text-amber-950 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed font-mono">
                <span className="font-black text-amber-900 block mb-1">💡 HOW TO FIX AND MAKE DATA SAVING WORK FROM ANYWHERE:</span>
                1. Go to your <span className="font-bold underline">MongoDB Atlas Dashboard</span>.<br />
                2. Click on <span className="font-bold underline">Network Access</span> (under Security).<br />
                3. Click <span className="font-bold underline">Add IP Address</span>.<br />
                4. Select <span className="font-bold underline">Allow Access From Anywhere</span> (or type <span className="font-bold font-mono text-indigo-700 font-extrabold">0.0.0.0/0</span>) and click Confirm.<br />
                5. Once whitelisted, refresh this app or click "Refresh" under Settings &gt; Database tab!
              </div>
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
