const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get token from localStorage
const getAuthToken = () => {
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth).token : null;
};

export const api = {
  // Generic fetch wrapper
  async fetch(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.statusText}`);
    }

    return response.json();
  },

  // Authentication
  auth: {
    login: (username: string, password: string) => api.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
    register: (data: any) => api.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    verify: (token: string) => api.fetch('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
    getMe: () => api.fetch('/auth/me'),
  },

  // Trainings
  trainings: {
    getAll: () => api.fetch('/trainings'),
    getById: (id: string) => api.fetch(`/trainings/${id}`),
    getEnrolled: (beneficiaryId: string) => api.fetch(`/trainings/enrolled/${beneficiaryId}`),
    getAvailable: (beneficiaryId: string) => api.fetch(`/trainings/available/${beneficiaryId}`),
    create: (data: any) => api.fetch('/trainings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/trainings/${id}`, {
      method: 'DELETE',
    }),
  },

  // Beneficiaries
  beneficiaries: {
    getAll: () => api.fetch('/beneficiaries'),
    getById: (id: string) => api.fetch(`/beneficiaries/${id}`),
    create: (data: any) => api.fetch('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/beneficiaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/beneficiaries/${id}`, {
      method: 'DELETE',
    }),
  },

  // Enrollments
  enrollments: {
    create: (data: any) => api.fetch('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getByBeneficiary: (beneficiaryId: string) => api.fetch(`/enrollments/beneficiary/${beneficiaryId}`),
    getByTraining: (trainingId: string) => api.fetch(`/enrollments/training/${trainingId}`),
    update: (id: string, data: any) => api.fetch(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/enrollments/${id}`, {
      method: 'DELETE',
    }),
  },

  // Attendance
  attendance: {
    getAll: (params?: { trainingId?: string; date?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.trainingId) searchParams.append('trainingId', params.trainingId);
      if (params?.date) searchParams.append('date', params.date);
      const query = searchParams.toString() ? `?${searchParams}` : '';
      return api.fetch(`/attendance${query}`);
    },
    checkIn: (data: any) => api.fetch('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMyRecords: (beneficiaryId: string) => api.fetch(`/attendance/my-records/${beneficiaryId}`),
    getByTraining: (trainingId: string) => api.fetch(`/attendance/training/${trainingId}`),
    update: (id: string, data: any) => api.fetch(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/attendance/${id}`, {
      method: 'DELETE',
    }),
  },
};
