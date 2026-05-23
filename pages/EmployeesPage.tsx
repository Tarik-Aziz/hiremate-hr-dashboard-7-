import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Mail, Shield, UserCircle } from "lucide-react";
import { subscribeToEmployees, Employee, deleteEmployee, addEmployee, updateEmployee, seedEmployees } from "../services/employeeService";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const { unsubscribe, refresh } = subscribeToEmployees((data) => {
      setEmployees(data);
      setLoading(false);
    });
    setRefreshTrigger(() => refresh);
    return () => unsubscribe();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    await seedEmployees();
    if (refreshTrigger) refreshTrigger();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
      if (refreshTrigger) refreshTrigger();
    }
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (emp.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (emp.jobTitle || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="ml-64 p-8 min-h-screen bg-[#FAFBFF]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 mt-1">Manage your team and staff directory</p>
        </div>
        <div className="flex items-center gap-3">
          {employees.length === 0 && (
            <button 
              onClick={handleSeed}
              className="px-6 py-3 border border-gray-200 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer"
            >
              Seed Data
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Total: {filteredEmployees.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Security</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mx-auto"></div>
                   </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No employees found.
                   </td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={emp.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {emp.photoURL ? (
                           <img src={emp.photoURL} alt={emp.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{emp.jobTitle}</p>
                    <p className="text-xs text-gray-400">{emp.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                      emp.security === "Verified" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                      emp.security === "Pending" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                      "bg-rose-50 text-rose-700 ring-rose-200"
                    )}>
                      <Shield className="w-3 h-3" />
                      {emp.security}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                      emp.status === "Permanent" || emp.status === "Active" ? "bg-blue-50 text-blue-700" :
                      emp.status === "Onboarding" ? "bg-purple-50 text-purple-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await addEmployee({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  jobTitle: formData.get("jobTitle") as string,
                  role: formData.get("role") as any,
                  status: formData.get("status") as any,
                  security: "Pending",
                  joinedAt: new Date().toISOString()
                });
                if (refreshTrigger) refreshTrigger();
                setIsAddModalOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input name="name" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                  <input name="jobTitle" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                    <select name="role" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Recruiter</option>
                      <option>HR Manager</option>
                      <option>Interviewer</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                    <select name="status" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Permanent</option>
                      <option>Onboarding</option>
                      <option>Active</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 cursor-pointer">Create Account</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
