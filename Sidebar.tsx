import {
  LayoutDashboard,
  FileText,
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  SearchCode,
  User,
  Settings,
} from "lucide-react";
import { SidebarItem } from "../types";
import { cn } from "../lib/utils";

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: FileText, label: "Report", id: "report" },
  { icon: Users, label: "Employees", id: "employees" },
  { icon: Briefcase, label: "Job Posting", id: "job-post" },
  { icon: UserCheck, label: "Candidate", id: "candidates" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: SearchCode, label: "Resume Parsing", id: "resume-parsing" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Settings, label: "Setting", id: "setting" },
];

interface SidebarProps {
  activeId: string;
  onSetActive: (id: string) => void;
  user: {
    displayName: string;
    photoURL: string;
    email: string;
  };
}

export function Sidebar({ activeId, onSetActive, user }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-white border-r border-gray-100 flex flex-col pt-6 fixed left-0 top-0 z-40">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Briefcase className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">HIREMATE</span>
      </div>

      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden ring-2 ring-white">
             <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || "User"}</p>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">HR Admin</p>
          </div>
          <button 
            onClick={() => onSetActive("setting")}
            className="ml-auto text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
             <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSetActive(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
              activeId === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeId === item.id ? "text-white" : "text-gray-400 group-hover:text-gray-900")} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
