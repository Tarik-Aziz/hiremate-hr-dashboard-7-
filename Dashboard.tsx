import { useState, useEffect } from "react";
import { Users, Eye, FileUser, UserMinus, Download, Database, Settings, Sparkles, Calendar, RefreshCcw } from "lucide-react";
import { StatCard } from "./StatCard";
import { JobChart } from "./JobChart";
import { Reminders } from "./Reminders";
import { getDashboardStats, DashboardStats, subscribeToDashboardStats } from "../services/dashboardService";
import { seedEmployees } from "../services/employeeService";
import { seedJobs } from "../services/jobService";
import { seedCandidates } from "../services/candidateService";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDashboardStats((newStats) => {
      setStats(newStats);
      setLoading(false);
    });

    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          console.warn(`Analytics fetch failed with status: ${response.status}`);
          return;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          if (!json.error) setAnalytics(json);
        } else {
          const text = await response.text();
          console.warn(`Analytics fetch returned non-JSON (status ${response.status}). Content-Type: ${contentType}. Body:`, text.slice(0, 100));
        }
      } catch (err) {
        console.error("Analytics fetch failed", err);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedEmployees();
      await seedJobs();
      await seedCandidates();
      const newStats = await getDashboardStats();
      if (newStats) setStats(newStats);
    } catch (err) {
      console.error("Seeding failed", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    
    // Create CSV content from stats
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Employees,${stats?.totalEmployees || 0}\n`
      + `Job Postings,${stats?.totalJobs || 0}\n`
      + `Total Candidates,${stats?.totalCandidates || 0}\n`
      + `Job Applied Growth,${stats?.jobAppliedGrowth || 0}%\n`
      + `Employees Growth,${stats?.employeesGrowth || 0}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hiremate_dashboard_report.csv");
    document.body.appendChild(link);

    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1000);
  };

  if (loading || !stats) {
    return (
      <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF] flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </main>
    );
  }

  const isEmpty = stats.totalEmployees === 0 && stats.totalJobs === 0 && stats.totalCandidates === 0;

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-gray-500 text-sm font-medium">Welcome back to HireMate Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-600">
             <Calendar className="w-4 h-4 text-indigo-600" />
             {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
              "bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed",
              isExporting && "animate-pulse"
            )}
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees.toLocaleString()}
          label="Employees"
          growth={stats.employeesGrowth}
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Job View"
          value={stats.jobViews.toLocaleString()}
          label="Viewers"
          growth={stats.jobViewsGrowth}
          icon={<Eye className="w-6 h-6" />}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Job Applied"
          value={stats.jobApplied.toLocaleString()}
          label="Applicants"
          growth={stats.jobAppliedGrowth}
          icon={<FileUser className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Resigned Employees"
          value={stats.resignedEmployees.toLocaleString()}
          label="Employee"
          growth={stats.resignedGrowth}
          icon={<UserMinus className="w-6 h-6" />}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JobChart data={analytics} />
        </div>
        <div className="lg:col-span-1">
          <Reminders />
        </div>
      </div>
    </main>
  );
}
