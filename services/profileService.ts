import { getApiUrl } from './api';

const API_URL = getApiUrl('/api/profile');

export interface Profile {
  id?: string;
  email: string;
  name: string;
  role: string;
  company: string;
  location: string;
  bio: string;
  avatar: string;
  activeProjects: number;
  candidatesHired: number;
  joinedAt: string;
  updatedAt?: string;
}

export const getProfile = async (email?: string): Promise<Profile | null> => {
  try {
    let url = API_URL;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`getProfile failed with status: ${response.status}`);
      return null;
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }
    const data = await response.json();
    if (data && data.error) {
      console.error("API Error in getProfile:", data.error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      console.error(`updateProfile failed with status: ${response.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("updateProfile failed:", err);
    return false;
  }
};
