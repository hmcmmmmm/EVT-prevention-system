import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('vte_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vte_token');
      localStorage.removeItem('vte_user');
      localStorage.removeItem('vte_permissions');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

export const patientApi = {
  getList: () => api.get('/patients'),
  getDetail: (id: string) => api.get(`/patients/${id}`),
  getLabs: (id: string) => api.get(`/patients/${id}/labs`),
};

export const assessmentApi = {
  getScaleFactors: (scaleType: string) =>
    api.get(`/assessments/scale-factors/${scaleType}`),
  getByPatient: (patientId: string) =>
    api.get(`/assessments/patient/${patientId}`),
  create: (data: any) => api.post('/assessments', data),
  getPreventionPlans: (patientId: string) =>
    api.get(`/assessments/prevention/${patientId}`),
  createPreventionPlan: (data: any) =>
    api.post('/assessments/prevention', data),
  getAlerts: (params?: { departmentId?: string; pending?: boolean }) =>
    api.get('/assessments/alerts', { params: { ...params, pending: params?.pending?.toString() } }),
  handleAlert: (id: string) =>
    api.patch(`/assessments/alerts/${id}/handle`),
};

export const statsApi = {
  getDashboard: (departmentId?: string) =>
    api.get('/stats/dashboard', { params: { departmentId } }),
  getQualityReport: () => api.get('/stats/quality-report'),
  getDepartments: () => api.get('/stats/departments'),
};

export const userApi = {
  getList: () => api.get('/users'),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle`),
};

export default api;
