import { getApiUrl } from './api';

const API_URL = getApiUrl('/api/candidates');

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  status: "Applied" | "Screened" | "Interview" | "Offer" | "Hired" | "Rejected";
  matchScore: number;
  matchVerdict: string;
  experience: string;
  skills: string[];
  appliedAt: string;
  reasons?: string[];
}

export const getCandidates = async (jobId?: string): Promise<Candidate[]> => {
  try {
    const url = jobId ? `${API_URL}?jobId=${jobId}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`getCandidates failed with status: ${response.status}`);
      return [];
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return [];
    }
    const data = await response.json();
    if (data && data.error) {
      console.error("API Error in getCandidates:", data.error);
      return [];
    }
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, id: item._id || item.id })) : [];
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return [];
  }
};

export const subscribeToCandidates = (callback: (candidates: Candidate[]) => void, jobId?: string) => {
  const fetchAndCallback = async () => {
    const data = await getCandidates(jobId);
    callback(data);
  };
  const interval = setInterval(fetchAndCallback, 30000);
  fetchAndCallback();
  return {
    unsubscribe: () => clearInterval(interval),
    refresh: fetchAndCallback
  };
};

export const addCandidate = async (candidate: Omit<Candidate, "id">) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate)
    });
    if (!response.ok) {
      console.error(`addCandidate failed with status: ${response.status}`);
      return "";
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return "";
    }
    const result = await response.json();
    return result._id || result.id || "";
  } catch (err) {
    console.error("addCandidate failed:", err);
    return "";
  }
};

export const updateCandidate = async (id: string, data: Partial<Candidate>) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteCandidate = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};

export const seedCandidates = async () => {
    const candidates: Omit<Candidate, "id">[] = [
        {
            name: "Alexandra Smith",
            email: "alex.smith@email.com",
            jobId: "job1",
            jobTitle: "Senior Frontend Developer",
            status: "Interview",
            matchScore: 94,
            matchVerdict: "Excellent Match",
            experience: "8 years",
            skills: ["React", "TypeScript", "Node.js"],
            appliedAt: "2024-02-20T10:00:00Z",
            reasons: ["8+ years experience", "Expert in React & TypeScript", "Leadership experience"]
        },
        {
            name: "Marcus Johnson",
            email: "marcus.j@email.com",
            jobId: "job2",
            jobTitle: "Product Manager",
            status: "Screened",
            matchScore: 88,
            matchVerdict: "Good Match",
            experience: "6 years",
            skills: ["Product Strategy", "Agile", "User Research"],
            appliedAt: "2024-02-18T10:00:00Z",
            reasons: ["Strong product background", "Agile certified"]
        },
        {
            name: "Sophie Chen",
            email: "sophie.c@email.com",
            jobId: "job3",
            jobTitle: "UX/UI Designer",
            status: "Offer",
            matchScore: 92,
            matchVerdict: "Excellent Match",
            experience: "5 years",
            skills: ["Figma", "User Research", "Prototyping"],
            appliedAt: "2024-02-15T10:00:00Z",
            reasons: ["Portfolio excellence", "User-centered design"]
        }
    ];

    for (const candidate of candidates) {
        await addCandidate(candidate);
    }
};
