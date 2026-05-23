import { Search, Bell, LogOut } from "lucide-react";

interface TopBarProps {
  onSignOut: () => void;
  userProfileUrl: string;
}

export function TopBar({ onSignOut, userProfileUrl }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 ml-64">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </span>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border-none bg-gray-50 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          placeholder="Search..."
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        <button 
          onClick={onSignOut}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-rose-600 transition-colors cursor-pointer group px-3 py-1.5 rounded-lg hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Sign Out</span>
        </button>

        {userProfileUrl && (
          <img 
            src={userProfileUrl} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border border-gray-100" 
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </header>
  );
}
