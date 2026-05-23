import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface JobChartProps {
  data: any[];
}

export function JobChart({ data }: JobChartProps) {
  // If no data, hide or show placeholder
  const safeData = data.length > 0 ? data : [
    { name: "...", hires: 0, applications: 0 }
  ];

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">Recruitment Trends</h3>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-500">Hires</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#6366F120] border border-indigo-200 rounded-full"></div>
              <span className="text-sm font-medium text-gray-500">Applications</span>
           </div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
               cursor={{ fill: '#F9FAFB' }}
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="applications" fill="#6366F120" stroke="#6366F140" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="hires" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
