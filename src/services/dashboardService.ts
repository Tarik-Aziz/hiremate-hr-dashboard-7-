export interface DashboardStats {
  totalEmployees: number;
  totalJobs?: number;
  totalCandidates?: number;
  jobViews: number;
  jobApplied: number;
  resignedEmployees: number;
  jobAppliedGrowth: number;
  resignedGrowth: number;
  jobViewsGrowth: number;
  employeesGrowth: number;
  warning?: string;
}

import { getApiUrl } from './api';

const API_URL = getApiUrl('/api/stats');

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error (status ${response.status}):`, errorText.slice(0, 100));
      return null;
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Expected JSON response but got:", contentType, "Body snippet:", text.slice(0, 200));
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

export const subscribeToDashboardStats = (callback: (stats: DashboardStats) => void) => {
  const interval = setInterval(async () => {
    const data = await getDashboardStats();
    if (data) callback(data);
  }, 30000);
  getDashboardStats().then(data => data && callback(data));
  return () => clearInterval(interval);
};

// We will remove seedStats from here because we want to seed actual documents now
export const seedStats = async () => {
  // This will be handled by seeding actual collections
  console.log("Stats are now derived from actual database collections.");
};
