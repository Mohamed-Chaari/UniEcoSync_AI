import axios from 'axios';

// Update this IP when network changes
const api = axios.create({
  baseURL: 'http://10.17.38.157:8000/api',
});

export interface RelocationSuggestion {
  suggested_room_id: string;
  suggested_room_name: string;
  capacity: number;
  energy_saving_estimate_kwh: number;
  action_items: string[];
  message: string;
}

export interface WeatherAlert {
  condition: string;
  temperature_c: number;
  humidity_percent: number;
  sustainability_actions: string[];
  severity: "low" | "medium" | "high";
}

export const getRelocationSuggestion = async (roomId: string, attendanceCount: number): Promise<RelocationSuggestion> => {
  const response = await api.post('/relocation/', {
    room_id: roomId,
    attendance_count: attendanceCount
  });
  return response.data;
};

export const getWeatherAlert = async (scenario?: "rain" | "heatwave" | "clear"): Promise<WeatherAlert> => {
  const url = scenario ? `/weather/?scenario=${scenario}` : '/weather/';
  const response = await api.get(url);
  return response.data;
};

export interface ReportRequest {
  type: string;
  description: string;
  location: string;
}

export interface ReportResponse {
  id: number;
  type: string;
  description: string;
  location: string;
  priority: 'Low' | 'Medium' | 'High';
  ai_analysis: string;
  created_at: string;
}

export interface AdminReportsResponse {
  reports: ReportResponse[];
  total_count: number;
}

export interface User {
  id: number;
  name: string;
  eco_points: number;
}

export const submitReport = async (report: ReportRequest): Promise<ReportResponse> => {
  const response = await api.post('/report/', report);
  return response.data;
};

export const getAdminReports = async (): Promise<AdminReportsResponse> => {
  const response = await api.get('/report/');
  return response.data;
};

export const getLeaderboard = async (): Promise<User[]> => {
  const response = await api.get('/leaderboard/');
  return response.data;
};

export const uploadScheduleCSV = async (formData: FormData): Promise<{ message: string }> => {
  const response = await api.post('/schedule/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export interface RoomSchedule {
  room_name: string;
  capacity: number;
}

export const getLiveSchedule = async (): Promise<{ rooms: RoomSchedule[] }> => {
  const response = await api.get('/schedule/live');
  return response.data;
};

export default api;
