import { useState, useEffect } from "react";
import { Download, Filter, TrendingUp, Users, Briefcase, ChevronDown, Clock } from "lucide-react";
import { cn } from "../lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";

export function ReportingPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          console.warn(`Analytics fetch failed with status: ${response.status}`);
          return;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          if (!json.error) {
            setData(json);
          }
        } else {
          const text = await response.text();
          console.warn(`Analytics fetch returned non-JSON (status ${response.status}). Content-Type: ${contentType}. Body:`, text.slice(0, 100));
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every 60s
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Create CSV content from analytics data
      let csvContent = "data:text/csv;charset=utf-8,Month,Hires,Applications\n";
      data.forEach((row) => {
        csvContent += `${row.name},${row.hires},${row.applications}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "hiremate_analytics_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1200);
  };

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Growth tracking and recruitment data performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all cursor-pointer">
            <Filter className="w-5 h-5" />
            Filter
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div> : <Download className="w-5 h-5" />}
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-bold text-gray-900">Hiring Pipeline</h3>
                <p className="text-sm text-gray-500">Monthly breakdown of successful hires</p>
             </div>
             <button className="text-gray-400 p-2 hover:bg-gray-50 rounded-xl cursor-pointer">
                <ChevronDown className="w-5 h-5" />
             </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="hires" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-bold text-gray-900">Application Volume</h3>
                <p className="text-sm text-gray-500">Interest trends across all departments</p>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                +24%
             </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Line type="monotone" dataKey="applications" stroke="#8B5CF6" strokeWidth={4} dot={{r: 6, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: "Retention Rate", value: "92%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Avg. Time to Hire", value: "18 Days", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
             { label: "Offer Acceptance", value: "85%", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                   <stat.icon className="w-7 h-7" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </main>
  );
}
