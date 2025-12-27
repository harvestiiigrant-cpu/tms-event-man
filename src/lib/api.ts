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
    updateProfile: (data: {
      name?: string;
      email?: string;
      phone?: string;
      profile_image_url?: string;
      theme_preference?: string;
      khmer_font?: string;
    }) =>
      api.fetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.fetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
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
    bulkDelete: (ids: string[]) => api.fetch('/trainings/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
    getExportData: (id: string) => api.fetch(`/trainings/${id}/export-participants`),
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
    bulkDelete: (ids: string[]) => api.fetch('/beneficiaries/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
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
    // Attendance Grid
    getGrid: (trainingId: string) => api.fetch(`/attendance/grid/${trainingId}`),
    bulkUpdate: (data: { training_id: string; records: any[]; manual_entry_reason?: string }) =>
      api.fetch('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Participant Transfers
  transfers: {
    preview: (data: { beneficiary_id: string; source_training_id: string; target_training_id: string }) =>
      api.fetch('/transfers/preview', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    execute: (data: { beneficiary_id: string; source_training_id: string; target_training_id: string }) =>
      api.fetch('/transfers/participant', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAvailableTrainings: (excludeTrainingId?: string) => {
      const query = excludeTrainingId ? `?exclude_training_id=${excludeTrainingId}` : '';
      return api.fetch(`/transfers/available-trainings${query}`);
    },
  },

  // Training Agendas
  agendas: {
    getByTraining: (trainingId: string) => api.fetch(`/trainings/${trainingId}/agendas`),
    create: (trainingId: string, data: any) => api.fetch(`/trainings/${trainingId}/agendas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/agendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/agendas/${id}`, {
      method: 'DELETE',
    }),
    bulkUpdate: (trainingId: string, agendas: any[]) => api.fetch(`/trainings/${trainingId}/agendas/bulk`, {
      method: 'POST',
      body: JSON.stringify({ agendas }),
    }),
    copyFrom: (trainingId: string, sourceTrainingId: string) =>
      api.fetch(`/trainings/${trainingId}/agendas/copy-from/${sourceTrainingId}`, {
        method: 'POST',
      }),
  },

  // Training Materials Library
  materials: {
    getAll: (params?: { category?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);
      const query = searchParams.toString() ? `?${searchParams}` : '';
      return api.fetch(`/materials${query}`);
    },
    getById: (id: string) => api.fetch(`/materials/${id}`),
    create: (data: any) => api.fetch('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    upload: async (file: File, metadata: any) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const token = getAuthToken();
      const response = await fetch(`${API_URL}/materials/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    update: (id: string, data: any) => api.fetch(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/materials/${id}`, {
      method: 'DELETE',
    }),

    // Training-Material linking
    getByTraining: (trainingId: string) => api.fetch(`/trainings/${trainingId}/materials`),
    linkToTraining: (trainingId: string, materialIds: string[]) =>
      api.fetch(`/trainings/${trainingId}/materials`, {
        method: 'POST',
        body: JSON.stringify({ materialIds }),
      }),
    unlinkFromTraining: (trainingId: string, materialId: string) =>
      api.fetch(`/trainings/${trainingId}/materials/${materialId}`, {
        method: 'DELETE',
      }),
    reorderInTraining: (trainingId: string, orderedIds: string[]) =>
      api.fetch(`/trainings/${trainingId}/materials/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
      }),
    copyFrom: (trainingId: string, sourceTrainingId: string) =>
      api.fetch(`/trainings/${trainingId}/materials/copy-from/${sourceTrainingId}`, {
        method: 'POST',
      }),
  },

  // Training Categories
  categories: {
    getAll: () => api.fetch('/categories'),
    create: (data: { code: string; name_en: string; name_km: string; description?: string; icon?: string; color?: string }) =>
      api.fetch('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { code: string; name_en: string; name_km: string; description?: string; icon?: string; color?: string }) =>
      api.fetch(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api.fetch(`/categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Training Types
  types: {
    getAll: () => api.fetch('/types'),
    create: (data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch('/types', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch(`/types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api.fetch(`/types/${id}`, {
      method: 'DELETE',
    }),
  },

  // Beneficiary Positions
  positions: {
    getAll: () => api.fetch('/positions'),
    create: (data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch('/positions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch(`/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api.fetch(`/positions/${id}`, {
      method: 'DELETE',
    }),
  },

  // Beneficiary Departments
  departments: {
    getAll: () => api.fetch('/departments'),
    create: (data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { code: string; name_en: string; name_km: string; description?: string }) =>
      api.fetch(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => api.fetch(`/departments/${id}`, {
      method: 'DELETE',
    }),
  },

  // Surveys & Tests
  surveys: {
    getAll: (params?: { type?: string; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append('type', params.type);
      if (params?.search) searchParams.append('search', params.search);
      const query = searchParams.toString() ? `?${searchParams}` : '';
      return api.fetch(`/surveys${query}`);
    },
    getById: (id: string) => api.fetch(`/surveys/${id}`),
    create: (data: any) =>
      api.fetch('/surveys', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      api.fetch(`/surveys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      api.fetch(`/surveys/${id}`, {
        method: 'DELETE',
      }),

    // Questions
    addQuestion: (surveyId: string, data: any) =>
      api.fetch(`/surveys/${surveyId}/questions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateQuestion: (surveyId: string, questionId: string, data: any) =>
      api.fetch(`/surveys/${surveyId}/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteQuestion: (surveyId: string, questionId: string) =>
      api.fetch(`/surveys/${surveyId}/questions/${questionId}`, {
        method: 'DELETE',
      }),

    // Training linking
    getByTraining: (trainingId: string) =>
      api.fetch(`/surveys/trainings/${trainingId}/surveys`),
    attachToTraining: (trainingId: string, data: { survey_id: string; timing: string; is_required?: boolean }) =>
      api.fetch(`/surveys/trainings/${trainingId}/surveys`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    detachFromTraining: (trainingId: string, linkId: string) =>
      api.fetch(`/surveys/trainings/${trainingId}/surveys/${linkId}`, {
        method: 'DELETE',
      }),

    // Responses
    getResponses: (surveyId: string, trainingId?: string) => {
      const query = trainingId ? `?training_id=${trainingId}` : '';
      return api.fetch(`/surveys/${surveyId}/responses${query}`);
    },
    startSurvey: (surveyId: string, beneficiaryId: string, trainingId: string) =>
      api.fetch(`/surveys/${surveyId}/start/${beneficiaryId}?training_id=${trainingId}`),
    submitResponse: (surveyId: string, data: any) =>
      api.fetch(`/surveys/${surveyId}/responses`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getResults: (surveyId: string, trainingId?: string) => {
      const query = trainingId ? `?training_id=${trainingId}` : '';
      return api.fetch(`/surveys/${surveyId}/results${query}`);
    },
    getBeneficiarySurveys: (beneficiaryId: string) =>
      api.fetch(`/surveys/beneficiaries/${beneficiaryId}/surveys`),
  },

  // Events
  events: {
    getAll: () => api.fetch('/events'),
    getPublic: () => api.fetch('/events/public'),
    getById: (id: string) => api.fetch(`/events/${id}`),
    getByIdPublic: (id: string) => api.fetch(`/events/${id}/public`),
    create: (data: any) => api.fetch('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/events/${id}`, {
      method: 'DELETE',
    }),
    bulkDelete: (ids: string[]) => api.fetch('/events/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
    getExportData: (id: string) => api.fetch(`/events/${id}/export-participants`),
  },

  // Event Sessions
  eventSessions: {
    getByEvent: (eventId: string) => api.fetch(`/event-sessions/event/${eventId}`),
    getById: (id: string) => api.fetch(`/event-sessions/${id}`),
    create: (data: any) => api.fetch('/event-sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/event-sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/event-sessions/${id}`, {
      method: 'DELETE',
    }),
    bulkCreate: (sessions: any[]) => api.fetch('/event-sessions/bulk', {
      method: 'POST',
      body: JSON.stringify({ sessions }),
    }),
    addSpeaker: (sessionId: string, speakerId: string, role?: string) =>
      api.fetch(`/event-sessions/${sessionId}/speakers`, {
        method: 'POST',
        body: JSON.stringify({ speaker_id: speakerId, role }),
      }),
    removeSpeaker: (sessionId: string, speakerId: string) =>
      api.fetch(`/event-sessions/${sessionId}/speakers/${speakerId}`, {
        method: 'DELETE',
      }),
  },

  // Event Registrations
  eventRegistrations: {
    getByEvent: (eventId: string) => api.fetch(`/event-registrations/event/${eventId}`),
    getById: (id: string) => api.fetch(`/event-registrations/${id}`),
    getByCode: (code: string) => api.fetch(`/event-registrations/code/${code}`),
    registerPublic: (data: any) => api.fetch('/event-registrations/public', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    create: (data: any) => api.fetch('/event-registrations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/event-registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    approve: (id: string, userId: string) => api.fetch(`/event-registrations/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }),
    reject: (id: string, userId: string) => api.fetch(`/event-registrations/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    }),
    cancel: (id: string) => api.fetch(`/event-registrations/${id}`, {
      method: 'DELETE',
    }),
    addSession: (registrationId: string, sessionId: string) =>
      api.fetch(`/event-registrations/${registrationId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId }),
      }),
    removeSession: (registrationId: string, sessionId: string) =>
      api.fetch(`/event-registrations/${registrationId}/sessions/${sessionId}`, {
        method: 'DELETE',
      }),
  },

  // Event Speakers
  eventSpeakers: {
    getByEvent: (eventId: string) => api.fetch(`/event-speakers/event/${eventId}`),
    getById: (id: string) => api.fetch(`/event-speakers/${id}`),
    create: (data: any) => api.fetch('/event-speakers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => api.fetch(`/event-speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => api.fetch(`/event-speakers/${id}`, {
      method: 'DELETE',
    }),
  },

  // Notifications
  notifications: {
    getAll: (params?: { limit?: number; unreadOnly?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.unreadOnly) searchParams.append('unreadOnly', 'true');
      const query = searchParams.toString() ? `?${searchParams}` : '';
      return api.fetch(`/notifications${query}`);
    },
    getUnreadCount: () => api.fetch('/notifications/unread-count'),
    markAsRead: (id: string) => api.fetch(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    markAllAsRead: () => api.fetch('/notifications/mark-all-read', {
      method: 'PUT',
    }),
    delete: (id: string) => api.fetch(`/notifications/${id}`, {
      method: 'DELETE',
    }),
    clearAll: () => api.fetch('/notifications', {
      method: 'DELETE',
    }),
  },
};
