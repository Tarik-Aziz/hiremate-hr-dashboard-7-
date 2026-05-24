import { getApiUrl } from './api';

const API_URL = getApiUrl('/api/employees');

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }
  const data = await response.json();
  if (data && data.error) {
    console.error("API Error:", data.error);
    return null;
  }
  return data;
};

export interface Employee {
  id: string;
  name: string;
  role: "HR Manager" | "Recruiter" | "Interviewer" | "Viewer" | "Super Admin";
  email: string;
  status: "Permanent" | "Onboarding" | "Active" | "Inactive" | "Resigned" | "Declined";
  security: "Verified" | "Pending" | "Revoked";
  jobTitle: string;
  joinedAt: string;
  photoURL?: string;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.warn(`getEmployees failed with status: ${response.status}`);
      return [];
    }
    const data = await parseJsonResponse(response);
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, id: item._id || item.id })) : [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

export const subscribeToEmployees = (callback: (employees: Employee[]) => void) => {
  const fetchAndCallback = async () => {
    const data = await getEmployees();
    callback(data);
  };
  const interval = setInterval(fetchAndCallback, 30000);
  fetchAndCallback();
  return {
    unsubscribe: () => clearInterval(interval),
    refresh: fetchAndCallback
  };
};

export const addEmployee = async (employee: Omit<Employee, "id">) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) {
      console.error(`addEmployee failed with status: ${response.status}`);
      return "";
    }
    const result = await parseJsonResponse(response);
    return result ? result._id || result.id || "" : "";
  } catch (err) {
    console.error("addEmployee failed:", err);
    return "";
  }
};

export const updateEmployee = async (id: string, data: Partial<Employee>) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteEmployee = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: 'GET' });
};

export const seedEmployees = async () => {
  const employees: Omit<Employee, "id">[] = [
    {
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      jobTitle: "Senior HR Manager",
      role: "HR Manager",
      status: "Permanent",
      security: "Verified",
      joinedAt: new Date().toISOString()
    },
    {
      name: "Michael Chen",
      email: "michael.c@company.com",
      jobTitle: "Talent Acquisition Lead",
      role: "Recruiter",
      status: "Permanent",
      security: "Verified",
      joinedAt: new Date().toISOString()
    },
    {
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      jobTitle: "Junior Recruiter",
      role: "Recruiter",
      status: "Onboarding",
      security: "Pending",
      joinedAt: new Date().toISOString()
    },
    {
       name: "David Kim",
       email: "david.k@company.com",
       jobTitle: "Technical Interviewer",
       role: "Interviewer",
       status: "Permanent",
       security: "Verified",
       joinedAt: new Date().toISOString()
    },
    {
       name: "Jessica Taylor",
       email: "jessica.t@company.com",
       jobTitle: "HR Coordinator",
       role: "Viewer",
       status: "Declined",
       security: "Revoked",
       joinedAt: new Date().toISOString()
    }
  ];

  for (const emp of employees) {
    await addEmployee(emp);
  }
};
