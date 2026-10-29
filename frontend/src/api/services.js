import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export const jobsApi = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  getByCompany: (companyId) => api.get(`/jobs/company/${companyId}`),
  search: (params) => api.get('/jobs/search', { params }),
  create: (job) => api.post('/jobs', job),
  update: (id, job) => api.put(`/jobs/${id}`, job),
  delete: (id) => api.delete(`/jobs/${id}`),
  close: (id) => api.put(`/jobs/${id}/close`),
  open: (id) => api.put(`/jobs/${id}/open`),
};

export const savedJobsApi = {
  getAll: () => api.get('/jobs/saved'),
  save: (jobId) => api.post(`/jobs/saved/${jobId}`),
  unsave: (jobId) => api.delete(`/jobs/saved/${jobId}`),
  check: (jobId) => api.get(`/jobs/saved/check/${jobId}`),
};

export const companiesApi = {
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  create: (company) => api.post('/companies', company),
  update: (id, company) => api.put(`/companies/${id}`, company),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const applicationsApi = {
  submit: (application) => api.post('/applications', application),
  getMyApplications: (email) => api.get('/applications/my', { params: email ? { email } : {} }),
  getByJob: (jobId) => api.get(`/applications/job/${jobId}`),
  getByCompany: (companyId) => api.get(`/applications/company/${companyId}`),
  getById: (id) => api.get(`/applications/${id}`),
  shortlist: (id) => api.put(`/applications/${id}/shortlist`),
  reject: (id, notes) => api.put(`/applications/${id}/reject`, notes ? { notes } : {}),
  scheduleInterview: (id, data) => api.put(`/applications/${id}/schedule-interview`, data),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

export const reviewsApi = {
  getByCompany: (companyId) => api.get('/reviews', { params: companyId ? { companyId } : {} }),
  create: (review) => api.post('/reviews', review, { params: { companyId: review.companyId } }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  getPendingRecruiters: () => api.get('/admin/users/pending-recruiters'),
  getPendingAdmins: () => api.get('/admin/users/pending-admins'),
  approveRecruiter: (userId, data) => api.post(`/admin/users/${userId}/approve-recruiter`, data || {}),
  rejectRecruiter: (userId) => api.post(`/admin/users/${userId}/reject-recruiter`),
  promoteToRecruiter: (userId) => api.post(`/admin/users/${userId}/promote-recruiter`),
  promoteToAdmin: (userId) => api.post(`/admin/users/${userId}/promote-admin`),
  suspendUser: (userId) => api.post(`/admin/users/${userId}/suspend`),
  activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

export const interviewsApi = {
  schedule: (data) => api.post('/interviews', data),
  getByApplication: (appId) => api.get(`/interviews/application/${appId}`),
  getForCandidate: (email) => api.get('/interviews/candidate', { params: email ? { email } : {} }),
  submitFeedback: (id, data) => api.put(`/interviews/${id}/feedback`, data),
  cancel: (id, reason) => api.put(`/interviews/${id}/cancel`, reason ? { reason } : {}),
};

export const auditApi = {
  getEvents: (params) => api.get('/audit/events', { params }),
};

export const resumesApi = {
  upload: (formData) => api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getCandidateResumes: (email) => api.get(`/resumes/candidate/${email}`),
};

export const notificationsApi = {
  getLogsByRecipient: (email) => api.get(`/notifications/logs/recipient/${email}`),
  getAllLogs: () => api.get('/notifications/logs'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (email) => api.put('/notifications/read-all', null, { params: { email } }),
};

export const searchApi = {
  searchJobs: (keyword) => api.get('/jobs/search', { params: { keyword } }),
  searchByLocation: (location) => api.get('/jobs/search', { params: { location } }),
  advancedSearch: (params) => api.get('/jobs/search', { params }),
};

export const agentApi = {
  startWorkflow: (data) => api.post('/agent/workflows', data),
  getAllWorkflows: () => api.get('/agent/workflows'),
  getWorkflow: (threadId) => api.get(`/agent/workflows/${threadId}`),
  approveJd: (threadId, data) => api.post(`/agent/workflows/${threadId}/approve-jd`, data),
  advanceSourcing: (threadId, data) => api.post(`/agent/workflows/${threadId}/advance-sourcing`, data || {}),
  approveShortlist: (threadId, data) => api.post(`/agent/workflows/${threadId}/approve-shortlist`, data),
  decideHiring: (threadId, data) => api.post(`/agent/workflows/${threadId}/decide-hiring`, data),
  approveOffer: (threadId, data) => api.post(`/agent/workflows/${threadId}/approve-offer`, data),
  candidateResponse: (threadId, data) => api.post(`/agent/workflows/${threadId}/candidate-response`, data),
  updateOnboardingTask: (threadId, data) => api.post(`/agent/workflows/${threadId}/onboarding-task`, data),
};
