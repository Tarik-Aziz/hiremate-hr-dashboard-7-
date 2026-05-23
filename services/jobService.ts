const API_URL = '/api/jobs';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  description: string;
  views: number;
  applicants: number;
  status: "Active" | "Draft" | "Closed";
  postedAt: string;
  platforms: string[];
}

export const getJobs = async (): Promise<Job[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.warn(`getJobs failed with status: ${response.status}`);
      return [];
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return [];
    }
    const data = await response.json();
    if (data && data.error) {
      console.error("API Error in getJobs:", data.error);
      return [];
    }
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, id: item._id || item.id })) : [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
};

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
  const fetchAndCallback = async () => {
    const data = await getJobs();
    callback(data);
  };
  const interval = setInterval(fetchAndCallback, 30000);
  fetchAndCallback();
  return {
    unsubscribe: () => clearInterval(interval),
    refresh: fetchAndCallback
  };
};

export const addJob = async (job: Omit<Job, "id">) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    if (!response.ok) {
      console.error(`addJob failed with status: ${response.status}`);
      return "";
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return "";
    }
    const result = await response.json();
    return result._id || result.id || "";
  } catch (err) {
    console.error("addJob failed:", err);
    return "";
  }
};

export const updateJob = async (id: string, data: Partial<Job>) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteJob = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};

export const seedJobs = async () => {
    const jobs: Omit<Job, "id">[] = [
        {
            title: "Senior Frontend Developer",
            department: "Engineering",
            location: "Remote",
            employmentType: "Full-time",
            salaryRange: "$90k - $120k",
            description: "We are looking for a Senior Frontend Developer...",
            views: 342,
            applicants: 45,
            status: "Active",
            postedAt: "2024-02-20T10:00:00Z",
            platforms: ["LinkedIn", "Company Site"]
        },
        {
            title: "Product Manager",
            department: "Product",
            location: "New York, NY",
            employmentType: "Full-time",
            salaryRange: "$100k - $140k",
            description: "Join us as a PM to lead our product strategy...",
            views: 215,
            applicants: 28,
            status: "Active",
            postedAt: "2024-02-18T10:00:00Z",
            platforms: ["LinkedIn", "Indeed", "Company Site"]
        },
        {
            title: "UX/UI Designer",
            department: "Design",
            location: "Hybrid",
            employmentType: "Full-time",
            salaryRange: "$70k - $95k",
            description: "Craft beautiful experiences for our users...",
            views: 489,
            applicants: 67,
            status: "Active",
            postedAt: "2024-02-15T10:00:00Z",
            platforms: ["LinkedIn", "Company Site", "Behance"]
        }
    ];

    for (const job of jobs) {
        await addJob(job);
    }
};
