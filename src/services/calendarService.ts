import { getApiUrl } from './api';

const API_URL = getApiUrl('/api/calendar-events');

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: string;
  color: string;
  date: string;
  dateDay: number;
  month: number;
  year: number;
  createdAt?: string;
}

export const getCalendarEvents = async (month?: number, year?: number): Promise<CalendarEvent[]> => {
  try {
    let url = API_URL;
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`getCalendarEvents failed with status: ${response.status}`);
      return [];
    }
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return [];
    }
    const data = await response.json();
    if (data && data.error) {
      console.error("API Error in getCalendarEvents:", data.error);
      return [];
    }
    return Array.isArray(data) ? data.map((item: any) => ({ ...item, id: item._id || item.id })) : [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

export const subscribeToCalendarEvents = (callback: (events: CalendarEvent[]) => void, month?: number, year?: number) => {
  const fetchAndCallback = async () => {
    const data = await getCalendarEvents(month, year);
    callback(data);
  };
  const interval = setInterval(fetchAndCallback, 30000);
  fetchAndCallback();
  return {
    unsubscribe: () => clearInterval(interval),
    refresh: fetchAndCallback
  };
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, "id">): Promise<CalendarEvent | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (!response.ok) {
      console.error(`addCalendarEvent failed with status: ${response.status}`);
      return null;
    }
    const result = await response.json();
    return { ...result, id: result._id || result.id };
  } catch (err) {
    console.error("addCalendarEvent failed:", err);
    return null;
  }
};

export const updateCalendarEvent = async (id: string, data: Partial<CalendarEvent>) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

export const deleteCalendarEvent = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};
