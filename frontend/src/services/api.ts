import axios from 'axios';
import {
  User,
  Conversation,
  Standard,
  Product,
  CertificationScheme,
  ComplianceRoadmap,
  GrievanceGuide,
  TelemetryStats,
  IngestionJob
} from '../types/index.js';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bis_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified response unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/* ================= AUTH API ================= */
export const authApi = {
  login: (data: { email: string; password: string }): Promise<{ success: boolean; data: { user: User; token: string } }> =>
    apiClient.post('/auth/login', data),
  
  register: (data: { email: string; password: string; name: string; role?: string; organization?: string }): Promise<{ success: boolean; data: { user: User; token: string } }> =>
    apiClient.post('/auth/register', data),
  
  getMe: (): Promise<{ success: boolean; data: User }> =>
    apiClient.get('/auth/me')
};

/* ================= CHAT API ================= */
export const chatApi = {
  sendMessage: (data: { message: string; conversationId?: string }): Promise<{
    success: boolean;
    data: {
      conversationId: string;
      messageId: string;
      answer: string;
      citations: any[];
      intent: string;
      language: string;
      confidence: number;
      suggestedQuestions: string[];
      latencyMs: number;
    }
  }> => apiClient.post('/chat', data),

  getConversations: (): Promise<{ success: boolean; data: Conversation[] }> =>
    apiClient.get('/chat/conversations'),

  getConversation: (id: string): Promise<{ success: boolean; data: Conversation }> =>
    apiClient.get(`/chat/conversations/${id}`),

  deleteConversation: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/chat/conversations/${id}`)
};

/* ================= STANDARDS API ================= */
export const standardsApi = {
  search: (params?: { q?: string; sector?: string; mandatory?: boolean; scheme?: string; limit?: number; offset?: number }): Promise<{
    success: boolean;
    data: { items: Standard[]; total: number; limit: number; offset: number; hasMore: boolean }
  }> => apiClient.get('/standards/search', { params }),

  getById: (id: string): Promise<{ success: boolean; data: Standard }> =>
    apiClient.get(`/standards/${id}`),

  getSectors: (): Promise<{ success: boolean; data: string[] }> =>
    apiClient.get('/standards/sectors')
};

/* ================= PRODUCTS API ================= */
export const productsApi = {
  search: (params?: { q?: string; category?: string }): Promise<{ success: boolean; data: Product[] }> =>
    apiClient.get('/products/search', { params }),

  getById: (id: string): Promise<{ success: boolean; data: Product }> =>
    apiClient.get(`/products/${id}`)
};

/* ================= SCHEMES API ================= */
export const schemesApi = {
  getSchemes: (): Promise<{ success: boolean; data: CertificationScheme[] }> =>
    apiClient.get('/schemes'),

  getScheme: (code: string): Promise<{ success: boolean; data: CertificationScheme }> =>
    apiClient.get(`/schemes/${code}`),

  generateChecklist: (data: { standardNo: string; productName?: string; scale?: string }): Promise<{ success: boolean; data: ComplianceRoadmap }> =>
    apiClient.post('/schemes/checklist/generate', data)
};

/* ================= GRIEVANCES API ================= */
export const grievanceApi = {
  getGuides: (category?: string): Promise<{ success: boolean; data: GrievanceGuide[] }> =>
    apiClient.get('/grievance/guides', { params: { category } }),

  getGuideById: (id: string): Promise<{ success: boolean; data: GrievanceGuide }> =>
    apiClient.get(`/grievance/guides/${id}`)
};

/* ================= ADMIN API ================= */
export const adminApi = {
  getTelemetry: (): Promise<{ success: boolean; data: TelemetryStats }> =>
    apiClient.get('/admin/telemetry'),

  getDocuments: (params?: { page?: number; limit?: number }): Promise<{ success: boolean; data: { documents: any[]; total: number } }> =>
    apiClient.get('/admin/documents', { params }),

  getJobs: (params?: { page?: number; limit?: number }): Promise<{ success: boolean; data: { jobs: IngestionJob[]; total: number } }> =>
    apiClient.get('/admin/jobs', { params }),

  triggerIngestion: (): Promise<{ success: boolean; data: IngestionJob }> =>
    apiClient.post('/admin/ingestion/run')
};

/* ================= FEEDBACK API ================= */
export const feedbackApi = {
  submit: (data: { messageId?: string; rating: number; citationAccuracy?: boolean; comment?: string; query?: string }): Promise<{ success: boolean }> =>
    apiClient.post('/feedback', data)
};
