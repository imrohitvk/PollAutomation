//frontend/src/utils/api.ts
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
//   baseURL: 'http://localhost:3000',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't auto-redirect on 401 during login/register attempts
    // Let the component handle the error instead
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Only clear token and redirect for authenticated requests, not login attempts
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // --- NEW: Auth services now use the axios instance ---
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { fullName: string; email: string; password: string; role: 'host' | 'student' }) =>
    api.post('/auth/register', userData),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  // User profile services
  updateProfile: (profileData: { fullName: string; bio: string }) =>
    api.put('/users/profile', profileData),

  uploadAvatar: (formData: FormData) =>
    api.post('/users/profile/avatar', formData),

  deleteAvatar: () =>
    api.delete('/users/profile/avatar'),

  // Polls
  createPoll: (data: any) => api.post('/polls', data),
  getHostPolls: (sessionId: string) => api.get(`/polls?sessionId=${sessionId}`),

  // Rooms
  createRoom: (data: { name: string }) => api.post('/rooms', data),
  getActiveRoom: () => api.get('/rooms/current'),
  getRoomByCode: (code: string) => api.get(`/rooms/${code}`),
  getRoomById: (roomId: string) => api.get(`/rooms/${roomId}`), // For verifying stored room
  sendInvites: (roomId: string, formData: FormData) => api.post(`/rooms/${roomId}/invite`, formData),
  getLiveParticipants: (roomId: string) => api.get(`/rooms/${roomId}/participants`),
  getAvailableSessionsWithPolls: () => api.get('/rooms/available/sessions'),
// getHostSessionReports: () => axios.get('/api/reports/host-sessions'),
  // Reports
  getReportForSession: (sessionId: string) => api.get(`/session-reports/session/${sessionId}`),
   // --- ADD THESE TWO LINES FOR THE HOST ---
  getHostSessionReports: () => api.get('/session-reports'), // Gets the list of reports
  getSessionReportById: (reportId: string) => api.get(`/session-reports/${reportId}`), // Gets a single detailed report
  // Student: get count of sessions joined by the authenticated user
  getMyJoinedSessionsCount: () => api.get('/session-reports/me'),
  getMyRecentSessions: () => api.get('/session-reports/me/recent'),
  getStudentPollHistory: () => api.get('/session-reports/me/polls'),
  getDebugSessionData: () => api.get('/session-reports/me/debug'),
  // Achievements
  getUserAchievements: () => api.get('/achievements/me'),
  getDebugAchievementData: () => api.get('/achievements/debug'),
  // Leaderboard (aggregated per-user stats)
  getLeaderboard: () => api.get('/reports/leaderboard'),
  // Stats
  getHostStats: () => api.get('/stats/host'),

  // Transcripts (ASR)
  getTranscriptsByMeeting: (meetingId: string, params?: { type?: 'partial' | 'final', role?: 'host' | 'participant', participantId?: string }) => 
    api.get(`/transcripts/${meetingId}`, { params }),
  getFullTranscript: (meetingId: string) => api.get(`/transcripts/${meetingId}/full`),
  exportTranscript: (meetingId: string) => api.get(`/transcripts/${meetingId}/export`, { responseType: 'blob' }),
  getTranscriptStats: (meetingId: string) => api.get(`/transcripts/${meetingId}/stats`),
  deleteTranscripts: (meetingId: string) => api.delete(`/transcripts/${meetingId}`),
  
  // ... any other services you have ...
};

export default api;